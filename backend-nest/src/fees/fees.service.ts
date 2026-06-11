import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeeEntity } from '../database/entities/fee.entity';
import { CreateFeeDto, UpdateFeeDto } from './dto/fees.dto';

interface CurrentUser { id: string; }

@Injectable()
export class FeesService {
  constructor(
    @InjectRepository(FeeEntity)
    private repo: Repository<FeeEntity>,
  ) {}

  findAll(schoolId = 'school_001') {
    return this.repo.find({ where: { schoolId }, order: { dueDate: 'DESC' } });
  }

  findMine(userId: string, schoolId = 'school_001') {
    return this.repo.find({
      where: { studentId: userId, schoolId },
      order: { dueDate: 'DESC' },
    });
  }

  async findOne(id: string) {
    const f = await this.repo.findOne({ where: { id } });
    if (!f) throw new NotFoundException('Fee record not found');
    return f;
  }

  async create(dto: CreateFeeDto) {
    const entity = this.repo.create({ ...dto, schoolId: dto.schoolId || 'school_001' });
    return this.repo.save(entity);
  }

  async update(id: string, dto: UpdateFeeDto) {
    await this.findOne(id);
    const updates: any = { ...dto };
    if (dto.paidAt) updates.paidAt = new Date(dto.paidAt);
    await this.repo.update(id, updates);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repo.delete(id);
  }
}
