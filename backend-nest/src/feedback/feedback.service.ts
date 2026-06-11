import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { FeedbackEntity } from '../database/entities/feedback.entity';
import { UserEntity } from '../database/entities/user.entity';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { Role } from '../common/enums/role.enum';
import { EmailService } from '../email/email.service';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(FeedbackEntity)
    private feedbackRepo: Repository<FeedbackEntity>,
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
    private notificationsService: NotificationsService,
    private emailService: EmailService,
  ) {}

  async createFeedback(principalId: string, dto: CreateFeedbackDto) {
    const teacher = await this.userRepo.findOne({ 
      where: { id: dto.teacherId, role: Role.TEACHER } 
    });
    
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    const feedback = this.feedbackRepo.create({
      ...dto,
      principalId,
    });

    const savedFeedback = await this.feedbackRepo.save(feedback);

    // Send notification to teacher
    await this.notificationsService.create(
      dto.teacherId,
      'New Feedback Received',
      `Principal sent you ${dto.type} feedback: ${dto.title}`,
      'feedback'
    );

    // Email Notification
    if (teacher.email) {
      console.log(`[DEBUG EMAIL] Attempting to send feedback email to: ${teacher.email}`);
      this.emailService.sendFeedbackEmail(
        teacher.email,
        teacher.name,
        dto.title,
        dto.message,
        dto.type
      ).catch(err => console.error(`[DEBUG EMAIL] Feedback email failed:`, err));
    } else {
      console.warn(`[DEBUG EMAIL] No email found for teacher: ${teacher.name}`);
    }

    return savedFeedback;
  }

  async getTeacherFeedback(teacherId: string) {
    return this.feedbackRepo.find({
      where: { teacherId },
      relations: ['principal'],
      order: { createdAt: 'DESC' },
    });
  }

  async getFeedbackTeachers() {
    console.log('[DEBUG] getFeedbackTeachers calling userRepo.find');
    const teachers = await this.userRepo.find({
      where: { teacherId: Not(IsNull()) },
      select: ['id', 'name'],
      order: { name: 'ASC' },
    });
    console.log('[DEBUG] Found teachers:', teachers.length);
    return teachers;
  }

  async getPrincipalSentFeedback(principalId: string) {
    return this.feedbackRepo.find({
      where: { principalId },
      relations: ['teacher'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateFeedback(principalId: string, id: string, dto: UpdateFeedbackDto) {
    const feedback = await this.feedbackRepo.findOne({ where: { id } });
    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }
    if (feedback.principalId !== principalId) {
      throw new ForbiddenException('You can only update feedback you created');
    }

    Object.assign(feedback, dto);
    const saved = await this.feedbackRepo.save(feedback);

    // Notify teacher about update
    this.notificationsService.create(
      feedback.teacherId,
      'Feedback Updated',
      `Principal updated your feedback: ${feedback.title}`,
      'feedback'
    ).catch(() => {});

    return saved;
  }

  async deleteFeedback(principalId: string, id: string) {
    const feedback = await this.feedbackRepo.findOne({ where: { id } });
    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }
    if (feedback.principalId !== principalId) {
      throw new ForbiddenException('You can only delete feedback you created');
    }

    await this.feedbackRepo.remove(feedback);
    return { success: true };
  }
}
