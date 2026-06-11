import { Injectable, BadRequestException, ForbiddenException, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttendanceEntity } from '../database/entities/attendance.entity';
import { MarkAttendanceDto, UpdateAttendanceDto } from './dto/attendance.dto';
import { AttendanceStatus } from './enums/attendance-status.enum';

@Injectable()
export class AttendanceService implements OnModuleInit {
  constructor(
    @InjectRepository(AttendanceEntity)
    private readonly attendanceRepo: Repository<AttendanceEntity>,
  ) {}

  async onModuleInit() {
    // Database cleanup migration: Convert any existing 'late' or 'half_day' records to 'present'
    try {
      await this.attendanceRepo
        .createQueryBuilder()
        .update(AttendanceEntity)
        .set({ status: AttendanceStatus.PRESENT })
        .where('status IN (:...statuses)', { statuses: ['late', 'half_day'] })
        .execute();
      console.log('Successfully migrated legacy attendance statuses (late/half_day -> present)');
    } catch (err) {
      console.error('Failed to migrate legacy attendance statuses:', err);
    }
  }

  async markAttendance(dto: MarkAttendanceDto, teacherId: string) {
    const { classId, date, section, subjectId, attendance } = dto;

    const newRecords = attendance.map((student) => {
      const record = new AttendanceEntity();
      record.classId = classId;
      record.date = date;
      record.section = section;
      record.subjectId = subjectId;
      record.studentId = student.studentId;
      record.status = student.status;
      record.remarks = student.remarks;
      record.markedByTeacherId = teacherId;
      return record;
    });

    // We can use save which will bulk insert or update if conflict on primary keys,
    // but since we have a unique constraint on studentId + date, we can use upsert
    // for robust handling, or manually check existing records.
    try {
      await this.attendanceRepo.upsert(newRecords, ['studentId', 'date']);
      
      // Phase 4: Notifications (Future Extensible Architecture)
      // Check for low attendance and trigger alerts asynchronously
      setTimeout(async () => {
        try {
          for (const student of attendance) {
            const summary = await this.getStudentAttendanceSummary(student.studentId);
            // Trigger alert if below 75% after a reasonable number of classes
            if (summary.totalClasses > 5 && summary.attendancePercentage < 75) {
              console.log(`[ALERT] Low Attendance: Student ${student.studentId} is at ${summary.attendancePercentage}%. Triggering Parent/Student Notification.`);
              // e.g. this.notificationService.sendLowAttendanceAlert(student.studentId, summary.attendancePercentage);
            }
          }
        } catch (e) {
          console.error('Failed to process attendance notifications', e);
        }
      }, 0); // Non-blocking

      return { message: 'Attendance marked successfully' };
    } catch (error) {
      throw new BadRequestException('Failed to mark attendance, duplicate entries or invalid data');
    }
  }

  async getStudentAttendanceSummary(studentId: string) {
    const records = await this.attendanceRepo.find({ where: { studentId } });
    
    const totalClasses = records.length;
    const presentDays = records.filter(r => r.status === AttendanceStatus.PRESENT).length;
    const absentDays = records.filter(r => r.status === AttendanceStatus.ABSENT).length;
    const leaveDays = records.filter(r => r.status === AttendanceStatus.LEAVE).length;

    const attendancePercentage = totalClasses === 0 ? 0 : Math.round((presentDays / totalClasses) * 100);

    // Calculate monthly progress
    const monthlyMap: Record<string, { total: number; present: number }> = {};
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    records.forEach(r => {
      const dateObj = new Date(r.date);
      const monthIndex = dateObj.getMonth(); // 0-11
      const monthName = monthNames[monthIndex];
      
      if (!monthlyMap[monthName]) {
        monthlyMap[monthName] = { total: 0, present: 0 };
      }
      monthlyMap[monthName].total += 1;
      
      if (r.status === AttendanceStatus.PRESENT) {
        monthlyMap[monthName].present += 1;
      }
    });

    const monthlyProgress = Object.keys(monthlyMap).map(month => ({
      month,
      attendance: Math.round((monthlyMap[month].present / monthlyMap[month].total) * 100)
    }));

    // Calculate subject-wise attendance
    const subjectMap: Record<string, { total: number; present: number }> = {};
    records.forEach(r => {
      if (r.subjectId) {
        if (!subjectMap[r.subjectId]) {
          subjectMap[r.subjectId] = { total: 0, present: 0 };
        }
        subjectMap[r.subjectId].total += 1;
        
        if (r.status === AttendanceStatus.PRESENT) {
          subjectMap[r.subjectId].present += 1;
        }
      }
    });

    // Mock subject names mapping for demo purposes. In real app, join with Subjects table.
    const mockSubjectNames: Record<string, string> = {
      'sub_math': 'Mathematics',
      'sub_sci': 'Science',
      'sub_eng': 'English',
      'sub_comp': 'Computer',
      'sub_sst': 'Social Science',
    };

    const subjectWiseAttendance = Object.keys(subjectMap).map(subjectId => ({
      subject: mockSubjectNames[subjectId] || subjectId,
      attendance: Math.round((subjectMap[subjectId].present / subjectMap[subjectId].total) * 100)
    }));

    return {
      attendancePercentage,
      presentDays,
      absentDays,
      leaveDays,
      totalClasses,
      monthlyProgress,
      subjectWiseAttendance,
      records // Provide records for detailed view
    };
  }

  async getClassAttendance(classId: string, date: string) {
    return this.attendanceRepo.find({ where: { classId, date } });
  }

  async updateAttendance(id: string, dto: UpdateAttendanceDto, userRole: string) {
    const record = await this.attendanceRepo.findOne({ where: { id } });
    if (!record) {
      throw new NotFoundException('Attendance record not found');
    }

    if (userRole === 'teacher') {
      const recordDate = new Date(record.date);
      const now = new Date();
      const timeDiff = now.getTime() - recordDate.getTime();
      const hoursDiff = timeDiff / (1000 * 3600);

      if (hoursDiff > 24) {
        throw new ForbiddenException('Teachers can only edit attendance within 24 hours');
      }
    }

    if (dto.status) record.status = dto.status;
    if (dto.remarks) record.remarks = dto.remarks;

    return this.attendanceRepo.save(record);
  }

  async getTeacherClasses(teacherId: string) {
    // Mock implementation for assigned classes since we don't have the full assignment entity details yet
    // In real app, query TeacherClassAssignment or Timetable
    return [
      { id: 'class_1', name: 'Class 10A' },
      { id: 'class_2', name: 'Class 10B' }
    ];
  }

  async getStudentAttendanceReportCSV(studentId: string): Promise<string> {
    const summary = await this.getStudentAttendanceSummary(studentId);
    
    let csv = 'Date,Status,Class,Subject,Remarks\n';
    
    // Sort records by date descending
    const sortedRecords = summary.records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    sortedRecords.forEach(r => {
      const subject = r.subjectId || 'Daily';
      const remarks = r.remarks ? r.remarks.replace(/,/g, '') : ''; // Sanitize commas for CSV
      csv += `${r.date},${r.status},${r.classId},${subject},${remarks}\n`;
    });
    
    return csv;
  }
}
