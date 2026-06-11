import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveApplicationEntity, LeaveStatus } from '../database/entities/leave-application.entity';
import { ProxyAssignmentEntity, ProxyStatus } from '../database/entities/proxy-assignment.entity';
import { TeacherEntity } from '../database/entities/teacher.entity';
import { UserEntity } from '../database/entities/user.entity';
import { TeacherLeaveBalanceEntity } from '../database/entities/teacher-leave-balance.entity';
import { StudentEntity } from '../database/entities/student.entity';
import { SubmitLeaveDto, ReviewLeaveDto, AssignProxyBatchDto } from './dto/leave.dto';
import { Role } from '../common/enums/role.enum';
import { EmailService } from '../email/email.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AcademicYearsService } from '../academic-years/academic-years.service';

interface CurrentUser {
  id: string;
  role: Role;
  teacherId?: string;
  studentId?: string;
  email?: string;
  schoolId?: string;
}

@Injectable()
export class LeaveService {
  constructor(
    @InjectRepository(LeaveApplicationEntity)
    private leaveRepo: Repository<LeaveApplicationEntity>,
    @InjectRepository(ProxyAssignmentEntity)
    private proxyRepo: Repository<ProxyAssignmentEntity>,
    @InjectRepository(TeacherEntity)
    private teacherRepo: Repository<TeacherEntity>,
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
    @InjectRepository(TeacherLeaveBalanceEntity)
    private balanceRepo: Repository<TeacherLeaveBalanceEntity>,
    @InjectRepository(StudentEntity)
    private studentRepo: Repository<StudentEntity>,
    private emailService: EmailService,
    private notificationsService: NotificationsService,
    private academicYearService: AcademicYearsService,
  ) {}

  // ─── Private helpers ────────────────────────────────────────────────────────

  private async getTeacherId(user: CurrentUser): Promise<string> {
    if (user.teacherId) return user.teacherId;
    if (user.email) {
      const teacher = await this.teacherRepo.findOne({ where: { email: user.email } });
      if (teacher) return teacher.id;
    }
    return user.id;
  }

  private async attachTeacherDetails<T extends { teacherId?: string }>(record: T) {
    const teachers = await this.teacherRepo.find();
    const users = await this.userRepo.find();

    const teacher = teachers.find((t) => t.id === record.teacherId || t.email === record.teacherId);
    const userRec = users.find((u) => u.id === record.teacherId || u.teacherId === record.teacherId);
    const teacherName = teacher?.name || userRec?.name || 'Unknown Teacher';

    return {
      ...record,
      leaveOwnerType: 'teacher',
      teacherName,
      teacher: {
        id: teacher?.id || record.teacherId,
        name: teacherName,
        full_name: teacherName,
        email: teacher?.email || userRec?.email,
        subject: teacher?.subjectNames?.[0] || '',
      },
    };
  }

  private async attachStudentDetails<T extends { studentId?: string }>(record: T) {
    const student = await this.studentRepo.findOne({ where: { studentId: (record as any).studentId } });
    const studentName = student?.fullName || 'Unknown Student';

    return {
      ...record,
      leaveOwnerType: 'student',
      studentName,
      student: {
        id: student?.id,
        studentId: student?.studentId,
        name: studentName,
        full_name: studentName,
        className: student?.className,
        section: student?.section,
      },
    };
  }

  private async attachDetails<T extends { leaveOwnerType?: string; teacherId?: string; studentId?: string }>(record: T) {
    if (record.leaveOwnerType === 'student') {
      return this.attachStudentDetails(record);
    }
    return this.attachTeacherDetails(record);
  }

  // ─── Public API ─────────────────────────────────────────────────────────────

  async findAll(user: CurrentUser) {
    const isPrivileged = [Role.ADMIN, Role.PRINCIPAL, Role.COORDINATOR].includes(user.role);

    // SECURITY: Students may ONLY see their own leaves — never teacher leaves
    if (user.role === Role.STUDENT) {
      const leaves = await this.leaveRepo.find({
        where: { studentId: user.studentId, leaveOwnerType: 'student' },
        order: { submittedAt: 'DESC' },
      });
      return Promise.all(leaves.map((leave) => this.attachStudentDetails(leave)));
    }

    // Privileged roles: see all leaves (both teacher and student)
    if (isPrivileged) {
      const leaves = await this.leaveRepo.find({ order: { submittedAt: 'DESC' } });
      return Promise.all(leaves.map((leave) => this.attachDetails(leave)));
    }

    // Teachers: see only their own teacher leaves
    const teacherId = await this.getTeacherId(user);
    const leaves = await this.leaveRepo.find({
      where: { teacherId, leaveOwnerType: 'teacher' },
      order: { submittedAt: 'DESC' },
    });
    return Promise.all(leaves.map((leave) => this.attachTeacherDetails(leave)));
  }

  async findOne(id: string) {
    const leave = await this.leaveRepo.findOne({ where: { id } });
    if (!leave) throw new NotFoundException('Leave application not found');
    return this.attachDetails(leave);
  }

  async getTeacherBalance(teacherId: string, academicYearId: number) {
    let balance = await this.balanceRepo.findOne({
      where: { teacherId, academicYearId }
    });

    if (!balance) {
      balance = await this.balanceRepo.save({
        teacherId,
        academicYearId,
        totalLeaves: 20,
        usedLeaves: 0,
        remainingLeaves: 20,
        schoolId: 'school_001'
      });
    }

    return {
      totalLeaves: Number(balance.totalLeaves),
      usedLeaves: Number(balance.usedLeaves),
      remainingLeaves: Number(balance.remainingLeaves)
    };
  }

  async getMyLeaveStats(user: CurrentUser) {
    // Students have no balance quota in V1 — return a simple placeholder
    if (user.role === Role.STUDENT) {
      const leaves = await this.leaveRepo.find({
        where: { studentId: user.studentId, leaveOwnerType: 'student' },
      });
      const total = leaves.length;
      const approved = leaves.filter(l => l.status === LeaveStatus.APPROVED).length;
      const pending = leaves.filter(l => l.status === LeaveStatus.PENDING).length;
      return { totalApplied: total, approved, pending };
    }

    const teacherId = await this.getTeacherId(user);
    const activeYear = await this.academicYearService.getActiveAcademicYear();
    return this.getTeacherBalance(teacherId, activeYear.id);
  }

  async submit(dto: SubmitLeaveDto, user: CurrentUser) {
    // ── Student leave flow (no balance check in V1) ──────────────────────────
    if (user.role === Role.STUDENT) {
      const entity = this.leaveRepo.create({
        studentId: user.studentId,
        leaveOwnerType: 'student',
        leaveType: dto.leaveType,
        startDate: dto.startDate,
        endDate: dto.endDate,
        leaveDuration: dto.leaveDuration || 'FULL_DAY',
        deductedLeaves: 0,
        reason: dto.reason,
        status: LeaveStatus.PENDING,
        submittedAt: new Date(),
        schoolId: user.schoolId || 'school_001',
      });
      const saved = await this.leaveRepo.save(entity);

      // Fetch student info for notification message
      const student = await this.studentRepo.findOne({ where: { studentId: user.studentId } });

      // Notify all admins/principals
      const approvers = await this.userRepo.find({
        where: [
          { role: Role.ADMIN, schoolId: user.schoolId || 'school_001' },
          { role: Role.PRINCIPAL, schoolId: user.schoolId || 'school_001' },
        ],
      });
      approvers.forEach((approver) => {
        this.notificationsService.create(
          approver.id,
          'New Student Leave Application',
          `${student?.fullName || 'A student'} (${user.studentId}) has applied for leave from ${new Date(dto.startDate).toLocaleDateString()}.`,
          'leave'
        ).catch(err => console.error('Failed to send notification to approver:', err));
      });

      return saved;
    }

    // ── Teacher leave flow (unchanged) ────────────────────────────────────────
    const teacherId = await this.getTeacherId(user);
    const activeYear = await this.academicYearService.getActiveAcademicYear();

    let deduction = 1;
    if (dto.leaveDuration === 'HALF_DAY') {
      deduction = 0.5;
    } else {
      const start = new Date(dto.startDate);
      const end = new Date(dto.endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end >= start) {
        const diffTime = end.getTime() - start.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        deduction = diffDays + 1;
      }
    }

    const balance = await this.getTeacherBalance(teacherId, activeYear.id);
    if (balance.remainingLeaves < deduction) {
      throw new BadRequestException('Insufficient leave balance for the current academic year');
    }

    const entity = this.leaveRepo.create({
      teacherId,
      leaveOwnerType: 'teacher',
      leaveType: dto.leaveType,
      startDate: dto.startDate,
      endDate: dto.endDate,
      leaveDuration: dto.leaveDuration || 'FULL_DAY',
      deductedLeaves: deduction,
      reason: dto.reason,
      status: LeaveStatus.PENDING,
      submittedAt: new Date(),
      schoolId: user.schoolId || 'school_001',
      academicYearId: activeYear.id,
    });
    const saved = await this.leaveRepo.save(entity);

    const teacher = await this.teacherRepo.findOne({ where: { id: teacherId } });
    const coordinators = await this.userRepo.find({
      where: [
        { role: Role.ADMIN, schoolId: user.schoolId || 'school_001' },
        { role: Role.PRINCIPAL, schoolId: user.schoolId || 'school_001' },
        { role: Role.COORDINATOR, schoolId: user.schoolId || 'school_001' },
      ],
    });
    coordinators.forEach((approver) => {
      this.emailService.sendLeaveApplicationNotification(
        approver.email,
        approver.name,
        teacher?.name || user.email || 'Teacher',
        new Date(dto.startDate).toLocaleDateString(),
        new Date(dto.endDate).toLocaleDateString(),
        dto.reason || 'No reason provided'
      );

      this.notificationsService.create(
        approver.id,
        'New Leave Application',
        `${teacher?.name || 'A teacher'} has applied for leave from ${new Date(dto.startDate).toLocaleDateString()}.`,
        'leave'
      ).catch(err => console.error('Failed to send in-app notification to approver:', err));
    });

    return saved;
  }

  async approve(id: string, dto: ReviewLeaveDto, user: CurrentUser) {
    const leave = await this.leaveRepo.findOne({ where: { id } });
    if (!leave) throw new NotFoundException('Leave application not found');

    if (leave.status === LeaveStatus.APPROVED) {
      throw new BadRequestException('Leave is already approved');
    }

    await this.leaveRepo.update(id, {
      status: LeaveStatus.APPROVED,
      approvedBy: user.id,
      approvedAt: new Date(),
      remarks: dto?.remarks || null,
    });

    // ── Student leave: no balance deduction, notify student directly ──────────
    if (leave.leaveOwnerType === 'student') {
      const student = await this.studentRepo.findOne({ where: { studentId: leave.studentId } });
      if (student) {
        this.notificationsService.create(
          student.id,
          'Leave Approved',
          `Your leave from ${leave.startDate} to ${leave.endDate} has been approved.`,
          'leave'
        ).catch(err => console.error('Failed to send student leave approval notification:', err));
      }
      return this.findOne(id);
    }

    // ── Teacher leave: deduct balance, notify teacher ─────────────────────────
    const balance = await this.balanceRepo.findOne({
      where: { teacherId: leave.teacherId, academicYearId: leave.academicYearId }
    });

    if (balance) {
      const deduction = Number(leave.deductedLeaves);
      if (Number(balance.remainingLeaves) < deduction) {
        throw new BadRequestException('Cannot approve leave: Teacher has insufficient leave balance');
      }
      const usedLeaves = Number(balance.usedLeaves) + deduction;
      const remainingLeaves = Number(balance.totalLeaves) - usedLeaves;
      await this.balanceRepo.update(balance.id, { usedLeaves, remainingLeaves });
    }

    const updated = await this.findOne(id);

    if ((updated as any).teacher?.email) {
      this.emailService.sendLeaveStatusEmail(
        (updated as any).teacher.email,
        (updated as any).teacher.name,
        LeaveStatus.APPROVED,
        new Date(leave.startDate).toLocaleDateString(),
        new Date(leave.endDate).toLocaleDateString(),
        dto?.remarks
      );
    }

    const isTeacherIdUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test((updated as any).teacher?.id || '');
    const whereConditions: any[] = [];
    if ((updated as any).teacher?.email) whereConditions.push({ email: (updated as any).teacher.email });
    if ((updated as any).teacher?.id) whereConditions.push({ teacherId: (updated as any).teacher.id });
    if (isTeacherIdUuid) whereConditions.push({ id: (updated as any).teacher.id });

    console.log('[DEBUG] Searching for userRec with conditions:', whereConditions);
    const userRec = whereConditions.length > 0 ? await this.userRepo.findOne({ where: whereConditions }) : null;
    console.log('[DEBUG] Found userRec:', userRec ? userRec.id : null);

    if (userRec) {
      const notification = await this.notificationsService.create(
        userRec.id,
        'Leave Approved',
        `Your leave from ${leave.startDate} to ${leave.endDate} has been approved`,
        'leave'
      );
      console.log('[DEBUG] Notification Created:', notification);
    } else {
      console.log('[DEBUG] Notification skipped: No associated userRec found for teacher.');
    }

    return updated;
  }

  async reject(id: string, dto: ReviewLeaveDto, user: CurrentUser) {
    const leave = await this.leaveRepo.findOne({ where: { id } });
    if (!leave) throw new NotFoundException('Leave application not found');

    await this.leaveRepo.update(id, {
      status: LeaveStatus.REJECTED,
      approvedBy: user.id,
      approvedAt: new Date(),
      remarks: dto.remarks || null,
    });

    const updated = await this.findOne(id);

    // ── Student leave: notify student directly ────────────────────────────────
    if (leave.leaveOwnerType === 'student') {
      const student = await this.studentRepo.findOne({ where: { studentId: leave.studentId } });
      if (student) {
        this.notificationsService.create(
          student.id,
          'Leave Rejected',
          `Your leave request from ${leave.startDate} to ${leave.endDate} was rejected. ${dto.remarks ? `Reason: ${dto.remarks}` : ''}`,
          'leave'
        ).catch(err => console.error('Failed to send student leave rejection notification:', err));
      }
      return updated;
    }

    // ── Teacher leave: email + in-app notification ────────────────────────────
    if ((updated as any).teacher?.email) {
      this.emailService.sendLeaveStatusEmail(
        (updated as any).teacher.email,
        (updated as any).teacher.name,
        LeaveStatus.REJECTED,
        new Date(leave.startDate).toLocaleDateString(),
        new Date(leave.endDate).toLocaleDateString(),
        dto?.remarks
      );
    }

    const isTeacherIdUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test((updated as any).teacher?.id || '');
    const whereConditions: any[] = [];
    if ((updated as any).teacher?.email) whereConditions.push({ email: (updated as any).teacher.email });
    if ((updated as any).teacher?.id) whereConditions.push({ teacherId: (updated as any).teacher.id });
    if (isTeacherIdUuid) whereConditions.push({ id: (updated as any).teacher.id });

    const userRec = whereConditions.length > 0 ? await this.userRepo.findOne({ where: whereConditions }) : null;
    if (userRec) {
      this.notificationsService.create(
        userRec.id,
        'Leave Rejected',
        `Your leave request was rejected. Reason: ${dto.remarks || 'No reason provided'}`,
        'leave'
      );
    }

    return updated;
  }

  async findAllProxies() {
    return this.proxyRepo.find({ order: { createdAt: 'DESC' } });
  }

  async assignProxyBatch(dto: AssignProxyBatchDto, user: CurrentUser) {
    if (!dto.assignments || dto.assignments.length === 0) {
      throw new BadRequestException('No proxy assignments provided');
    }

    const leave = await this.leaveRepo.findOne({ where: { id: dto.leaveId } });
    if (!leave) {
      throw new NotFoundException('Leave application not found');
    }

    if (leave.status !== LeaveStatus.APPROVED) {
      throw new BadRequestException('Cannot assign proxy before approval');
    }

    await this.proxyRepo.delete({ leaveApplicationId: dto.leaveId });

    const entries = dto.assignments.map((a) =>
      this.proxyRepo.create({
        leaveApplicationId: dto.leaveId,
        originalTeacherId: a.originalTeacherId,
        proxyTeacherId: a.proxyTeacherId,
        classId: a.classId,
        subjectId: a.subjectId,
        date: a.date,
        periodId: String(a.period),
        status: ProxyStatus.APPROVED,
        approvedBy: user.id,
        approvedAt: new Date(),
      }),
    );

    await this.proxyRepo.save(entries);

    for (const assignment of dto.assignments) {
      const proxyTeacher = await this.userRepo.findOne({ where: { teacherId: assignment.proxyTeacherId } });
      if (proxyTeacher?.email) {
        this.emailService.sendProxyAssignedEmail(
          proxyTeacher.email,
          proxyTeacher.name,
          assignment.classId,
          assignment.date,
          String(assignment.period)
        );
      }
    }

    await this.leaveRepo.update(dto.leaveId, { proxyAssigned: true });

    return { message: 'Proxy assigned successfully', count: entries.length };
  }

  async approveProxy(id: string, user: CurrentUser) {
    const proxy = await this.proxyRepo.findOne({ where: { id } });
    if (!proxy) throw new NotFoundException('Proxy assignment not found');

    await this.proxyRepo.update(id, {
      status: ProxyStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: user.id,
    });
    return this.proxyRepo.findOne({ where: { id } });
  }

  async rejectProxy(id: string, user: CurrentUser) {
    const proxy = await this.proxyRepo.findOne({ where: { id } });
    if (!proxy) throw new NotFoundException('Proxy assignment not found');

    await this.proxyRepo.update(id, {
      status: ProxyStatus.REJECTED,
      approvedAt: new Date(),
      approvedBy: user.id,
    });
    return this.proxyRepo.findOne({ where: { id } });
  }
}
