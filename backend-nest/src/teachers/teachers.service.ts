import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { TeacherEntity } from '../database/entities/teacher.entity';
import { UserEntity } from '../database/entities/user.entity';
import { SubjectEntity } from '../database/entities/subject.entity';
import { CreateTeacherDto, UpdateTeacherDto } from './dto/teachers.dto';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(TeacherEntity)
    private repo: Repository<TeacherEntity>,
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
    @InjectRepository(SubjectEntity)
    private subjectRepo: Repository<SubjectEntity>,
  ) {}

  findAll(schoolId = 'school_001') {
    return this.repo.find({ where: { schoolId }, order: { name: 'ASC' } });
  }

  async findOne(id: string) {
    const t = await this.repo.findOne({ where: { id } });
    if (!t) throw new NotFoundException('Teacher not found');
    return t;
  }

  async create(dto: CreateTeacherDto) {
    if (dto.subjectId) {
      const subject = await this.subjectRepo.findOne({ where: { id: dto.subjectId } });
      if (!subject) throw new NotFoundException('Subject not found');
    }

    const existingUser = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existingUser) throw new ConflictException('Email already registered');

    const existingTeacher = await this.repo.findOne({ where: { email: dto.email } });
    if (existingTeacher) throw new ConflictException('A teacher with this email already exists');

    if (dto.isClassTeacher) {
      if (!dto.classTeacherClassId) {
        throw new BadRequestException('classTeacherClassId is required when assigning a Class Teacher');
      }
      const existingClassTeacher = await this.repo.findOne({ 
        where: { classTeacherClassId: dto.classTeacherClassId, isClassTeacher: true } 
      });
      if (existingClassTeacher) {
        throw new ConflictException(`Teacher ${existingClassTeacher.name} is already assigned as Class Teacher for this class`);
      }
    } else {
      dto.classTeacherClassId = null;
    }

    const { password, ...teacherData } = dto;
    const id = teacherData.id || `TCH${randomUUID().replace(/-/g, '').slice(0, 17)}`;
    const employeeCode = teacherData.employeeCode || `EMP${Date.now()}`.slice(0, 20);

    const entity = this.repo.create({
      ...teacherData,
      id,
      employeeCode,
      schoolId: teacherData.schoolId || 'school_001',
    });
    const savedTeacher = await this.repo.save(entity);

    const passwordHash = await bcrypt.hash(password, 12);
    const user = this.userRepo.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      role: Role.TEACHER,
      teacherId: savedTeacher.id,
      schoolId: teacherData.schoolId || 'school_001',
    });
    await this.userRepo.save(user);

    return savedTeacher;
  }

  async update(id: string, dto: UpdateTeacherDto) {
    const teacher = await this.findOne(id);

    if (dto.subjectId) {
      const subject = await this.subjectRepo.findOne({ where: { id: dto.subjectId } });
      if (!subject) throw new NotFoundException('Subject not found');
    }

    const isNowClassTeacher = dto.isClassTeacher !== undefined ? dto.isClassTeacher : teacher.isClassTeacher;
    const targetClassId = dto.classTeacherClassId !== undefined ? dto.classTeacherClassId : teacher.classTeacherClassId;

    if (isNowClassTeacher) {
      if (!targetClassId) {
        throw new BadRequestException('classTeacherClassId is required when assigning a Class Teacher');
      }
      const existingClassTeacher = await this.repo.createQueryBuilder('teacher')
        .where('teacher.classTeacherClassId = :classId', { classId: targetClassId })
        .andWhere('teacher.isClassTeacher = :isClassTeacher', { isClassTeacher: true })
        .andWhere('teacher.id != :id', { id })
        .getOne();
        
      if (existingClassTeacher) {
        throw new ConflictException(`Teacher ${existingClassTeacher.name} is already assigned as Class Teacher for this class`);
      }
    } else if (dto.isClassTeacher === false) {
      dto.classTeacherClassId = null;
    }

    await this.repo.update(id, dto);

    const userUpdates: Partial<UserEntity> = {};
    if (dto.name) userUpdates.name = dto.name;
    if (dto.email) userUpdates.email = dto.email;
    if (Object.keys(userUpdates).length) {
      await this.userRepo.update({ teacherId: id }, userUpdates);
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.userRepo.delete({ teacherId: id });
    await this.repo.delete(id);
  }
}
