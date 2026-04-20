import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PeriodEntity } from '../database/entities/period.entity';
import { CreatePeriodDto, UpdatePeriodDto } from './dto/periods.dto';

@Injectable()
export class PeriodsService {
  constructor(
    @InjectRepository(PeriodEntity)
    private repo: Repository<PeriodEntity>,
  ) {}

  findAll(schoolId = 'school_001') {
    return this.repo.find({ where: { schoolId }, order: { number: 'ASC' } });
  }

  async findOne(id: string) {
    const p = await this.repo.findOne({ where: { id } });
    if (!p) throw new NotFoundException('Period not found');
    return p;
  }

  async create(dto: CreatePeriodDto) {
    const entity = this.repo.create({ ...dto, schoolId: dto.schoolId || 'school_001' });
    return this.repo.save(entity);
  }

  async update(id: string, dto: UpdatePeriodDto) {
    await this.findOne(id);
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repo.delete(id);
  }
}
