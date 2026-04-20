import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimetableEntity } from '../database/entities/timetable.entity';
import { TimetableSettingsEntity } from '../database/entities/timetable-settings.entity';
import { SaveTimetableDto, SaveTimetableSettingsDto } from './dto/timetable.dto';

interface CurrentUser { id: string; }

@Injectable()
export class TimetableService {
  constructor(
    @InjectRepository(TimetableEntity)
    private repo: Repository<TimetableEntity>,
    @InjectRepository(TimetableSettingsEntity)
    private settingsRepo: Repository<TimetableSettingsEntity>,
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
    // Upsert: deactivate existing active timetable and create a new draft
    await this.repo.update({ schoolId, isActive: true }, { isActive: false });
    const entity = this.repo.create({ grids: dto.grids, schoolId, isActive: false });
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
    return this.repo.findOne({ where: { id } });
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
    const entity = this.repo.create({
      grids: dto.grids,
      schoolId,
      isActive: true,
      publishedAt: new Date(),
      publishedBy: user.id,
    });
    return this.repo.save(entity);
  }
}
