import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailboxEntity } from '../database/entities/mailbox.entity';
import { StudentEntity } from '../database/entities/student.entity';
import { CreateMailboxDto, UpdateMailboxDto } from './dto/mailbox.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { Role } from '../common/enums/role.enum';

interface CurrentUser {
  id: string;
  role: Role;
  schoolId?: string;
  name?: string;
}

@Injectable()
export class MailboxService {
  constructor(
    @InjectRepository(MailboxEntity)
    private readonly repo: Repository<MailboxEntity>,
    @InjectRepository(StudentEntity)
    private readonly studentRepo: Repository<StudentEntity>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateMailboxDto, user: CurrentUser) {
    const message = this.repo.create({
      ...dto,
      senderName: user.name || (user.role === Role.ADMIN ? 'System Administrator' : 'Principal Office'),
      senderRole: user.role,
      schoolId: user.schoolId || 'school_001',
    });
    
    const saved = await this.repo.save(message);

    // Notify all students
    const students = await this.studentRepo.find();
    for (const student of students) {
      await this.notificationsService.create(
        student.id,
        'New Mailbox Message',
        `New notice from ${saved.senderName}`,
        'mailbox' 
      ).catch(e => console.error('Failed to send mailbox notification to student:', e));
    }

    return saved;
  }

  async findAll(user: CurrentUser) {
    return this.repo.find({
      where: { schoolId: user.schoolId || 'school_001' },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, user: CurrentUser) {
    const message = await this.repo.findOne({ where: { id, schoolId: user.schoolId || 'school_001' } });
    if (!message) throw new NotFoundException('Mailbox message not found');
    return message;
  }

  async update(id: string, dto: UpdateMailboxDto, user: CurrentUser) {
    const message = await this.findOne(id, user);
    await this.repo.update(id, dto);
    return this.findOne(id, user);
  }

  async remove(id: string, user: CurrentUser) {
    const message = await this.findOne(id, user);
    await this.repo.remove(message);
    return { success: true };
  }
}
