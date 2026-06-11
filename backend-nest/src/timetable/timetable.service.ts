import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimetableEntity } from '../database/entities/timetable.entity';
import { TimetableSettingsEntity } from '../database/entities/timetable-settings.entity';
import { TeacherEntity } from '../database/entities/teacher.entity';
import { StudentEntity } from '../database/entities/student.entity';
import { SaveTimetableDto, SaveTimetableSettingsDto } from './dto/timetable.dto';
import { EmailService } from '../email/email.service';
import { AcademicYearsService } from '../academic-years/academic-years.service';
import { NotificationsService } from '../notifications/notifications.service';
import { UserEntity } from '../database/entities/user.entity';

interface CurrentUser { id: string; }

function normalizeEffectiveDates(dto: SaveTimetableDto) {
  return {
    effectiveFrom: dto.effectiveFrom || null,
    effectiveTo: dto.effectiveTo || null,
  };
}

@Injectable()
export class TimetableService {
  constructor(
    @InjectRepository(TimetableEntity)
    private repo: Repository<TimetableEntity>,
    @InjectRepository(TimetableSettingsEntity)
    private settingsRepo: Repository<TimetableSettingsEntity>,
    @InjectRepository(TeacherEntity)
    private teacherRepo: Repository<TeacherEntity>,
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
    @InjectRepository(StudentEntity)
    private studentRepo: Repository<StudentEntity>,
    private emailService: EmailService,
    private academicYearService: AcademicYearsService,
    private notificationsService: NotificationsService,
  ) {}

  async getActive(schoolId = 'school_001') {
    const tt = await this.repo.findOne({
      where: { schoolId, isActive: true },
      order: { publishedAt: 'DESC' },
    });
    return tt || null;
  }

  findHistory(schoolId = 'school_001') {
    return this.repo.find({ where: { schoolId }, order: { createdAt: 'DESC' } });
  }

  async save(dto: SaveTimetableDto, user: CurrentUser) {
    const schoolId = dto.schoolId || 'school_001';
    const activeYear = await this.academicYearService.getActiveAcademicYear();

    // Upsert: deactivate existing active timetable and create a new draft
    await this.repo.update({ schoolId, isActive: true }, { isActive: false });
    const entity = this.repo.create({
      grids: dto.grids,
      schoolId,
      isActive: false,
      academicYearId: activeYear.id,
      ...normalizeEffectiveDates(dto),
    });
    return this.repo.save(entity);
  }

  async publish(id: string, user: CurrentUser) {
    const tt = await this.repo.findOne({ where: { id } });
    if (!tt) throw new NotFoundException('Timetable not found');

    // Deactivate all others, then activate this one
    await this.repo.update({ schoolId: tt.schoolId }, { isActive: false });
    await this.repo.update(id, {
      isActive: true,
      publishedAt: new Date(),
      publishedBy: user.id,
    });

    const updated = await this.repo.findOne({ where: { id } });

    // Notify all teachers about the newly published timetable
    await this.notifyTeachers(tt.schoolId, 'New Timetable');

    return updated;
  }

  private async notifyTeachers(schoolId: string, ttName: string) {
    const teachers = await this.teacherRepo.find({ where: { schoolId } });
    
    for (const teacher of teachers) {
      // Email
      this.emailService.sendTimetablePublishedEmail(teacher.email, teacher.name).catch(() => {});
      
      // In-App/Push
      const user = await this.userRepo.findOne({ where: { email: teacher.email } });
      if (user) {
        this.notificationsService.create(
          user.id,
          'Timetable Published',
          `The academic timetable "${ttName}" has been officially published.`,
          'timetable'
        ).catch(() => {});
      }
    }
  }

  // ─── Settings ─────────────────────────────────────────────────────────────

  async getSettings(schoolId = 'school_001') {
    return this.settingsRepo.findOne({ where: { schoolId } }) || null;
  }

  async saveSettings(dto: SaveTimetableSettingsDto) {
    const schoolId = dto.schoolId || 'school_001';
    const existing = await this.settingsRepo.findOne({ where: { schoolId } });
    if (existing) {
      await this.settingsRepo.update(existing.id, {
        periodSlots: dto.periodSlots,
        workingDays: dto.workingDays,
        rules: dto.rules,
      });
      return this.settingsRepo.findOne({ where: { schoolId } });
    }
    const entity = this.settingsRepo.create({
      schoolId,
      periodSlots: dto.periodSlots,
      workingDays: dto.workingDays,
      rules: dto.rules,
    });
    return this.settingsRepo.save(entity);
  }

  async saveAndPublish(dto: SaveTimetableDto, user: CurrentUser) {
    const schoolId = dto.schoolId || 'school_001';
    await this.repo.update({ schoolId }, { isActive: false });
    if (dto.grids) {
      for (const classId of Object.keys(dto.grids)) {
        await this.repo.delete({ classId, status: 'draft' });
        await this.repo.delete({ classId, status: 'published' });
      }
    }
    const entity = this.repo.create({
      grids: dto.grids,
      schoolId,
      isActive: true,
      publishedAt: new Date(),
      publishedBy: user.id,
      status: 'published',
      ...normalizeEffectiveDates(dto),
    });
    const saved = await this.repo.save(entity);

    // Notify all teachers immediately on save & publish
    await this.notifyTeachers(schoolId, 'New Timetable');

    return saved;
  }

  async saveDraft(dto: any, user: CurrentUser) {
    const schoolId = dto.schoolId || 'school_001';
    // Clear old draft ONLY
    await this.repo.delete({ classId: dto.classId, status: 'draft' });

    const entity = this.repo.create({
      classId: dto.classId,
      grids: dto.grids,
      schoolId,
      isActive: false,
      status: 'draft',
    });
    return this.repo.save(entity);
  }

  async publishDraft(dto: any, user: CurrentUser) {
    const schoolId = dto.schoolId || 'school_001';
    // Remove old published for this class
    await this.repo.delete({ classId: dto.classId, status: 'published' });

    // Convert draft → published
    const draft = await this.repo.findOne({ where: { classId: dto.classId, status: 'draft' } });
    if (draft) {
      await this.repo.update({ id: draft.id }, {
        status: 'published',
        isActive: true,
        publishedAt: new Date(),
        publishedBy: user.id,
      });
    } else {
      const entity = this.repo.create({
        classId: dto.classId,
        grids: dto.grids,
        status: 'published',
        schoolId,
        isActive: true,
        publishedAt: new Date(),
        publishedBy: user.id,
      });
      await this.repo.save(entity);
    }
    return { message: 'Published successfully' };
  }

  async getByClass(classId: string) {
    // try draft first
    const draft = await this.repo.findOne({ where: { classId, status: 'draft' } });
    if (draft) return draft;

    // fallback to published
    const pub = await this.repo.findOne({ where: { classId, status: 'published' } });
    return pub || null;
  }

  async getTeacherTimetable(user: any) {
    return this.repo.find({ where: { status: 'published' } });
  }

  async deleteByClass(classId: string, schoolId = 'school_001') {
    await this.repo.delete({ classId });
    const all = await this.repo.find({ where: { schoolId } });
    for (const tt of all) {
      if (tt.grids && tt.grids[classId]) {
        delete tt.grids[classId];
        await this.repo.save(tt);
      }
    }
    return { message: 'Timetable deleted successfully' };
  }

  async getStudentTimetable(user: any) {
    const student = await this.studentRepo.findOne({ where: { id: user.id } });
    if (!student) throw new NotFoundException('Student not found');
    
    const classId = `${student.className}-${student.section}`;
    
    // fetch the published timetable for this class
    const pub = await this.repo.findOne({ where: { classId, status: 'published', schoolId: user.schoolId || 'school_001' } });
    
    // If not found by row, check the active document (backward compatibility for old schema)
    if (!pub) {
      const active = await this.getActive(user.schoolId);
      if (active && active.grids && active.grids[classId]) {
        return { grids: { [classId]: active.grids[classId] }, classId };
      }
      return null; // not found
    }
    
    return pub;
  }
}
