import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { MessageEntity } from '../database/entities/message.entity';
import { TeacherEntity } from '../database/entities/teacher.entity';
import { StudentEntity } from '../database/entities/student.entity';
import { UserEntity } from '../database/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateMessageDto, ReplyMessageDto } from './dto/messages.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(MessageEntity)
    private repo: Repository<MessageEntity>,
    @InjectRepository(TeacherEntity)
    private teacherRepo: Repository<TeacherEntity>,
    @InjectRepository(StudentEntity)
    private studentRepo: Repository<StudentEntity>,
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
    private notificationsService: NotificationsService,
  ) {}

  private async getName(id: string, role: string): Promise<string> {
    if (role === 'teacher') {
      const t = await this.teacherRepo.findOne({ where: { id } });
      return t ? t.name : 'Teacher';
    } else if (role === 'student') {
      const s = await this.studentRepo.findOne({ where: { id } });
      return s ? s.fullName : 'Student';
    }
    return 'User';
  }

  async getConversations(userId: string, role: string, q?: string) {
    const query = this.repo.createQueryBuilder('msg')
      .where(new Brackets(qb => {
        qb.where('msg.receiverId = :userId AND msg.deletedByReceiver = false', { userId })
          .orWhere('msg.senderId = :userId AND msg.deletedBySender = false', { userId });
      }))
      .orderBy('msg.createdAt', 'DESC');

    if (q) {
      query.andWhere(new Brackets(qb => {
        qb.where('msg.subject ILIKE :q', { q: `%${q}%` })
          .orWhere('msg.senderName ILIKE :q', { q: `%${q}%` })
          .orWhere('msg.message ILIKE :q', { q: `%${q}%` });
      }));
    }

    const messages = await query.getMany();
    
    // Group by conversationId to return latest message per conversation
    const convMap = new Map<string, MessageEntity>();
    for (const msg of messages) {
      if (!convMap.has(msg.conversationId)) {
        convMap.set(msg.conversationId, msg);
      } else {
        const existing = convMap.get(msg.conversationId);
        if (new Date(msg.createdAt) > new Date(existing.createdAt)) {
          convMap.set(msg.conversationId, msg);
        }
      }
    }

    return Array.from(convMap.values());
  }

  async getSentMessages(userId: string, role: string, q?: string) {
    const query = this.repo.createQueryBuilder('msg')
      .where('msg.senderId = :userId', { userId })
      .andWhere('msg.deletedBySender = false')
      .orderBy('msg.createdAt', 'DESC');

    if (q) {
      query.andWhere(new Brackets(qb => {
        qb.where('msg.subject ILIKE :q', { q: `%${q}%` })
          .orWhere('msg.receiverName ILIKE :q', { q: `%${q}%` })
          .orWhere('msg.message ILIKE :q', { q: `%${q}%` });
      }));
    }

    return query.getMany();
  }

  async getConversationDetails(conversationId: string, userId: string) {
    const messages = await this.repo.find({
      where: [
        { conversationId, receiverId: userId, deletedByReceiver: false },
        { conversationId, senderId: userId, deletedBySender: false }
      ],
      order: { createdAt: 'ASC' }
    });

    if (messages.length === 0) {
      throw new NotFoundException('Conversation not found');
    }

    // Mark unread messages as read
    const unreadIds = messages
      .filter(m => m.receiverId === userId && !m.isRead)
      .map(m => m.id);

    if (unreadIds.length > 0) {
      await this.repo.update(unreadIds, { 
        isRead: true, 
        readAt: new Date() 
      });
      // Update locally for returning
      messages.forEach(m => {
        if (unreadIds.includes(m.id)) {
          m.isRead = true;
          m.readAt = new Date();
        }
      });
    }

    return messages;
  }

  async getUnreadCount(userId: string) {
    const count = await this.repo.count({
      where: {
        receiverId: userId,
        isRead: false,
        deletedByReceiver: false,
      }
    });
    return { unreadCount: count };
  }

  async sendMessage(senderId: string, senderRole: string, dto: CreateMessageDto) {
    if (senderRole !== 'teacher' && senderRole !== 'student') {
      throw new ForbiddenException('Only teachers and students can use the mailbox');
    }

    let receiverRole = senderRole === 'teacher' ? 'student' : 'teacher';

    // Verify rules
    if (senderRole === 'teacher' && receiverRole !== 'student') {
      throw new BadRequestException('Teachers can only message students');
    }
    if (senderRole === 'student' && receiverRole !== 'teacher') {
      throw new BadRequestException('Students can only message teachers');
    }

    const senderName = await this.getName(senderId, senderRole);

    const sendSingleMessage = async (rId: string, role: string) => {
      const receiverName = await this.getName(rId, role);
      const conversationId = randomUUID();
      
      const msg = this.repo.create({
        conversationId,
        senderId,
        senderRole,
        senderName,
        receiverId: rId,
        receiverRole: role,
        receiverName,
        subject: dto.subject,
        message: dto.message,
      });

      const saved = await this.repo.save(msg);

      // Notification
      const route = role === 'teacher' ? '/teacher/mailbox' : '/student/mailbox';
      await this.notificationsService.create(
        rId,
        'New Message',
        `You received a new message from ${senderName}`,
        'mailbox'
      );
      return saved;
    };

    if (dto.isBroadcastToClass && senderRole === 'teacher') {
      // Broadcast to Class logic
      const teacher = await this.teacherRepo.findOne({ where: { id: senderId } });
      if (!teacher || !teacher.isClassTeacher || !teacher.classTeacherClassId) {
        throw new BadRequestException('You are not assigned as a Class Teacher');
      }

      const studentsInClass = await this.studentRepo.find({ where: { className: teacher.classTeacherClassId } });
      if (!studentsInClass.length) {
        throw new BadRequestException('No students found in this class');
      }

      for (const st of studentsInClass) {
        await sendSingleMessage(st.id, 'student');
      }
      return { success: true, count: studentsInClass.length, message: 'Broadcasted to class' };
    }

    return sendSingleMessage(dto.receiverId, receiverRole);
  }

  async replyMessage(senderId: string, senderRole: string, dto: ReplyMessageDto) {
    // find conversation
    const prevMsg = await this.repo.findOne({ 
      where: { conversationId: dto.conversationId },
      order: { createdAt: 'DESC' }
    });

    if (!prevMsg) throw new NotFoundException('Conversation not found');

    // To reply, the sender must be either the original sender or receiver of the conversation
    if (prevMsg.senderId !== senderId && prevMsg.receiverId !== senderId) {
      throw new ForbiddenException('Not authorized to reply to this conversation');
    }

    const receiverId = prevMsg.senderId === senderId ? prevMsg.receiverId : prevMsg.senderId;
    const receiverRole = prevMsg.senderRole === senderRole ? prevMsg.receiverRole : prevMsg.senderRole;
    const receiverName = prevMsg.senderName === await this.getName(senderId, senderRole) ? prevMsg.receiverName : prevMsg.senderName;
    const senderName = await this.getName(senderId, senderRole);

    const msg = this.repo.create({
      conversationId: dto.conversationId,
      senderId,
      senderRole,
      senderName,
      receiverId,
      receiverRole,
      receiverName,
      subject: `Re: ${prevMsg.subject.replace(/^Re:\s*/, '')}`,
      message: dto.message,
    });

    const saved = await this.repo.save(msg);

    const route = receiverRole === 'teacher' ? '/teacher/mailbox' : '/student/mailbox';
    await this.notificationsService.create(
      receiverId,
      'New Reply',
      `${senderName} replied to your message`,
      'mailbox'
    );

    return saved;
  }

  async deleteMessage(id: string, userId: string) {
    const msg = await this.repo.findOne({ where: { id } });
    if (!msg) throw new NotFoundException('Message not found');

    if (msg.senderId === userId) {
      await this.repo.update(id, { deletedBySender: true });
    } else if (msg.receiverId === userId) {
      await this.repo.update(id, { deletedByReceiver: true });
    } else {
      throw new ForbiddenException('Not authorized to delete this message');
    }

    return { success: true };
  }
}
