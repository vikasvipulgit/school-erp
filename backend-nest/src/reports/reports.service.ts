import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ReportEntity } from '../database/entities/report.entity';
import { TaskAssignmentEntity, TaskAssignmentStatus } from '../database/entities/task-assignment.entity';
import { ProxyAssignmentEntity } from '../database/entities/proxy-assignment.entity';
import { CreateReportDto } from './dto/reports.dto';
import { AcademicYearsService } from '../academic-years/academic-years.service';

interface CurrentUser { id: string; }

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(ReportEntity)
    private repo: Repository<ReportEntity>,
    @InjectRepository(TaskAssignmentEntity)
    private assignmentRepo: Repository<TaskAssignmentEntity>,
    @InjectRepository(ProxyAssignmentEntity)
    private proxyRepo: Repository<ProxyAssignmentEntity>,
    private academicYearService: AcademicYearsService,
  ) {}

  getSubstitutionReport(date: string) {
    return this.proxyRepo.query(`
      SELECT p.date, c.name as class_name, s.name as subject_name,
             t1.name as original_teacher,
             t2.name as proxy_teacher
      FROM proxy_assignments p
      JOIN teachers t1 ON p.original_teacher_id = t1.id
      JOIN teachers t2 ON p.proxy_teacher_id = t2.id
      JOIN classes c ON p.class_id = c.id
      JOIN subjects s ON p.subject_id = s.id
      WHERE p.date = $1
    `, [date]);
  }

  getPendingTasksReport() {
    return this.assignmentRepo.query(`
      SELECT t.title as task_title, te.name as teacher, t.priority, t.due_date, a.status
      FROM task_assignments a
      JOIN tasks t ON a.task_id = t.id
      JOIN teachers te ON a.teacher_id = te.id
      WHERE a.status IN ('not_started', 'in_progress')
    `);
  }

  getOverdueTasksReport() {
    return this.assignmentRepo.query(`
      SELECT t.title as task_title, te.name as teacher, t.due_date,
             (CURRENT_DATE - t.due_date::date) as days_overdue
      FROM task_assignments a
      JOIN tasks t ON a.task_id = t.id
      JOIN teachers te ON a.teacher_id = te.id
      WHERE a.status = 'overdue'
    `);
  }


  findAll(schoolId = 'school_001') {
    return this.repo.find({ where: { schoolId }, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    const r = await this.repo.findOne({ where: { id } });
    if (!r) throw new NotFoundException('Report not found');
    return r;
  }

  async create(dto: CreateReportDto, user: CurrentUser) {
    const activeYear = await this.academicYearService.getActiveAcademicYear();

    const entity = this.repo.create({
      ...dto,
      createdBy: user.id,
      schoolId: dto.schoolId || 'school_001',
      academicYearId: activeYear.id,
    });
    return this.repo.save(entity);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repo.delete(id);
  }
}
