import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AcademicYearEntity } from '../database/entities/academic-year.entity';
import { TeacherEntity } from '../database/entities/teacher.entity';
import { TeacherLeaveBalanceEntity } from '../database/entities/teacher-leave-balance.entity';

@Injectable()
export class AcademicYearsService {
  constructor(
    @InjectRepository(AcademicYearEntity)
    private repo: Repository<AcademicYearEntity>,
    @InjectRepository(TeacherEntity)
    private teacherRepo: Repository<TeacherEntity>,
    @InjectRepository(TeacherLeaveBalanceEntity)
    private balanceRepo: Repository<TeacherLeaveBalanceEntity>,
  ) {}

  async findAll(schoolId = 'school_001') {
    return this.repo.find({
      where: { schoolId },
      order: { startDate: 'DESC' },
    });
  }

  async getActiveAcademicYear(schoolId = 'school_001') {
    const active = await this.repo.findOne({
      where: { schoolId, isActive: true },
    });
    if (!active) {
      throw new NotFoundException('No active academic year found');
    }
    return active;
  }

  async create(dto: any) {
    const { name, startDate, endDate, schoolId = 'school_001' } = dto;

    if (new Date(startDate) >= new Date(endDate)) {
      throw new BadRequestException('End date must be after start date');
    }

    const existing = await this.repo.findOne({ where: { name, schoolId } });
    if (existing) {
      throw new BadRequestException('Academic year with this name already exists');
    }

    const year = this.repo.create({
      ...dto,
      schoolId,
      isActive: false, // Default to inactive
    });

    return this.repo.save(year);
  }

  async activate(id: number, schoolId = 'school_001') {
    const year = await this.repo.findOne({ where: { id, schoolId } });
    if (!year) throw new NotFoundException('Academic year not found');

    // Deactivate current active year
    await this.repo.update({ schoolId, isActive: true }, { isActive: false });

    // Activate this year
    await this.repo.update(id, { isActive: true });

    // CREATE LEAVE BALANCES FOR ALL TEACHERS
    const teachers = await this.teacherRepo.find({ where: { schoolId } });
    for (const teacher of teachers) {
      const existingBalance = await this.balanceRepo.findOne({
        where: { teacherId: teacher.id, academicYearId: id }
      });
      
      if (!existingBalance) {
        await this.balanceRepo.save({
          teacherId: teacher.id,
          academicYearId: id,
          totalLeaves: 20,
          usedLeaves: 0,
          remainingLeaves: 20,
          schoolId
        });
      }
    }

    return { message: `Academic year ${year.name} activated successfully and leave balances reset.` };
  }

  async update(id: number, dto: any) {
    const year = await this.repo.findOne({ where: { id } });
    if (!year) throw new NotFoundException('Academic year not found');

    if (dto.startDate && dto.endDate) {
      if (new Date(dto.startDate) >= new Date(dto.endDate)) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    await this.repo.update(id, dto);
    return this.repo.findOne({ where: { id } });
  }
}
