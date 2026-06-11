import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CircularEntity } from '../database/entities/circular.entity';
import { StudentEntity } from '../database/entities/student.entity';
import { CreateCircularDto, UpdateCircularDto } from './circular.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { Role } from '../common/enums/role.enum';

interface CurrentUser {
  id: string;
  role: Role;
  schoolId?: string;
}

@Injectable()
export class CircularService {
  constructor(
    @InjectRepository(CircularEntity)
    private readonly repo: Repository<CircularEntity>,
    @InjectRepository(StudentEntity)
    private readonly studentRepo: Repository<StudentEntity>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateCircularDto, user: CurrentUser) {
    const circular = this.repo.create({
      ...dto,
      createdBy: user.id,
      createdByRole: user.role,
      schoolId: user.schoolId || 'school_001',
    });
    
    const saved = await this.repo.save(circular);

    // Notify all students
    const students = await this.studentRepo.find();
    for (const student of students) {
      await this.notificationsService.create(
        student.id,
        'New Circular Published',
        `${saved.title} has been published`,
        'circular' // Use 'circular' or fallback to 'task' if needed. We'll pass 'circular'
      ).catch(e => console.error('Failed to send notification to student:', e));
    }

    return saved;
  }

  async findAll(user: CurrentUser) {
    // If student, they only see published circulars (which are all published by default)
    // Actually, all users see published circulars for now, but we can filter by schoolId
    return this.repo.find({
      where: { schoolId: user.schoolId || 'school_001' },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, user: CurrentUser) {
    const circular = await this.repo.findOne({ where: { id, schoolId: user.schoolId || 'school_001' } });
    if (!circular) throw new NotFoundException('Circular not found');
    return circular;
  }

  async update(id: string, dto: UpdateCircularDto, user: CurrentUser) {
    const circular = await this.findOne(id, user);
    await this.repo.update(id, dto);
    return this.findOne(id, user);
  }

  async remove(id: string, user: CurrentUser) {
    const circular = await this.findOne(id, user);
    await this.repo.remove(circular);
    return { success: true };
  }
}
