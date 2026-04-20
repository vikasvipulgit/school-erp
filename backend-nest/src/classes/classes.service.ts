import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchoolClassEntity } from '../database/entities/class.entity';
import { CreateClassDto, UpdateClassDto } from './dto/classes.dto';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(SchoolClassEntity)
    private repo: Repository<SchoolClassEntity>,
  ) {}

  findAll(schoolId = 'school_001') {
    return this.repo.find({ where: { schoolId }, order: { name: 'ASC' } });
  }

  async findOne(id: string) {
    const c = await this.repo.findOne({ where: { id } });
    if (!c) throw new NotFoundException('Class not found');
    return c;
  }

  async create(dto: CreateClassDto) {
    const entity = this.repo.create({ ...dto, schoolId: dto.schoolId || 'school_001' });
    return this.repo.save(entity);
  }

  async update(id: string, dto: UpdateClassDto) {
    await this.findOne(id);
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repo.delete(id);
  }
}
