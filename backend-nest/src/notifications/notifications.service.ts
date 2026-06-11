import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationEntity } from '../database/entities/notification.entity';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationEntity)
    private repo: Repository<NotificationEntity>,
    private firebaseService: FirebaseService,
  ) {}

  async create(userId: string, title: string, message: string, type = 'task') {
    const notification = await this.repo.save({
      userId,
      title,
      message,
      type,
    });

    // Determine route based on type
    const routeMap = {
      leave: '/leave',
      task: '/tasks',
      feedback: '/feedback',
      proxy: '/leave',
      timetable: '/timetable',
      circular: '/student/circulars',
      mailbox: '/student/mailbox',
      achievement: '/student/achievements',
    };

    // Trigger FCM
    await this.firebaseService.sendToUser(userId, title, message, {
      type,
      notificationId: notification.id,
      route: routeMap[type] || '/',
    });

    return notification;
  }

  async findAllForUser(userId: string) {
    return this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(id: string) {
    return this.repo.update(id, { isRead: true });
  }

  async markAllAsRead(userId: string) {
    return this.repo.update({ userId, isRead: false }, { isRead: true });
  }
}
