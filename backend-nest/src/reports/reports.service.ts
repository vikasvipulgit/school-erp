import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportEntity } from '../database/entities/report.entity';
import { CreateReportDto } from './dto/reports.dto';

interface CurrentUser { id: string; }

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(ReportEntity)
    private repo: Repository<ReportEntity>,
  ) {}

  findAll(schoolId = 'school_001') {
    return this.repo.find({ where: { schoolId }, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    const r = await this.repo.findOne({ where: { id } });
    if (!r) throw new NotFoundException('Report not found');
    return r;
  }

  async create(dto: CreateReportDto, user: CurrentUser) {
    const entity = this.repo.create({
      ...dto,
      createdBy: user.id,
      schoolId: dto.schoolId || 'school_001',
    });
    return this.repo.save(entity);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repo.delete(id);
  }
}
