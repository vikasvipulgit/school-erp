import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentEntity } from '../database/entities/student.entity';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(StudentEntity)
    private studentRepo: Repository<StudentEntity>,
  ) {}

  async getStudentsByClass(classId: string) {
    let students = await this.studentRepo.find({
      order: { fullName: 'ASC' }
    });
    
    if (students.length === 0) {
      return [];
    }

    return students.map((s) => ({
      id: s.id,
      studentId: s.studentId, // e.g. ST101 — this is what attendance.studentId stores
      name: s.fullName,
      className: s.className,
      section: s.section,
    }));
  }

  async findAll() {
    let students = await this.studentRepo.find({
      order: { fullName: 'ASC' }
    });

    return students.map((s) => ({
      id: s.id,
      studentId: s.studentId,
      name: s.fullName,
      className: s.className,
      section: s.section,
      class: s.className // For frontend compatibility
    }));
  }
}
