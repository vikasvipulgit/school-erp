import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AchievementEntity } from '../database/entities/achievement.entity';
import { StudentEntity } from '../database/entities/student.entity';
import { CreateAchievementDto, UpdateAchievementDto } from './dto/achievement.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { Role } from '../common/enums/role.enum';

interface CurrentUser {
  id: string;
  role: Role;
  schoolId?: string;
  studentId?: string;
}

@Injectable()
export class AchievementsService {
  constructor(
    @InjectRepository(AchievementEntity)
    private readonly repo: Repository<AchievementEntity>,
    @InjectRepository(StudentEntity)
    private readonly studentRepo: Repository<StudentEntity>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateAchievementDto, user: CurrentUser) {
    // Resolve student info from the short studentId (e.g. STU001)
    const student = await this.studentRepo.findOne({ where: { studentId: dto.studentId } });
    if (!student) throw new NotFoundException(`Student with ID ${dto.studentId} not found`);

    const achievement = this.repo.create({
      ...dto,
      studentId: student.id, // Store the UUID
      studentName: student.fullName,
      studentRefId: student.studentId,
      className: `${student.className}-${student.section}`,
      createdBy: user.id,
      createdByRole: user.role,
      schoolId: user.schoolId || 'school_001',
      featured: dto.featured ?? false,
    });

    const saved = await this.repo.save(achievement);

    // Send notification to the specific student
    await this.notificationsService.create(
      dto.studentId,
      'New Achievement Added! 🏆',
      `Congratulations! "${saved.title}" has been added to your profile.`,
      'achievement',
    ).catch(e => console.error('Failed to notify student of achievement:', e));

    return saved;
  }

  async findAll(user: CurrentUser) {
    if (user.role === Role.STUDENT) {
      // Students see only their own achievements
      return this.repo.find({
        where: { studentId: user.id, schoolId: user.schoolId || 'school_001' },
        order: { createdAt: 'DESC' },
      });
    }
    // Admin/Principal see all achievements for the school
    return this.repo.find({
      where: { schoolId: user.schoolId || 'school_001' },
      order: { createdAt: 'DESC' },
    });
  }

  async getStudentAchievements(user: CurrentUser) {
    return this.repo.find({
      where: { studentId: user.id, schoolId: user.schoolId || 'school_001' },
      order: { featured: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string, user: CurrentUser) {
    const achievement = await this.repo.findOne({
      where: { id, schoolId: user.schoolId || 'school_001' },
    });
    if (!achievement) throw new NotFoundException('Achievement not found');
    return achievement;
  }

  async update(id: string, dto: UpdateAchievementDto, user: CurrentUser) {
    await this.findOne(id, user);
    await this.repo.update(id, dto);
    return this.findOne(id, user);
  }

  async remove(id: string, user: CurrentUser) {
    const achievement = await this.findOne(id, user);
    await this.repo.remove(achievement);
    return { success: true };
  }

  async getStudents(schoolId = 'school_001') {
    return this.studentRepo.find({ order: { fullName: 'ASC' } });
  }
}
