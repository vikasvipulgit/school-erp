import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../database/entities/user.entity';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private firebaseApp: admin.app.App;

  constructor(
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
  ) {}

  onModuleInit() {
    try {
      const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
        : null;

      if (serviceAccount) {
        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        this.logger.log('Firebase Admin SDK initialized successfully');
      } else {
        this.logger.warn('FIREBASE_SERVICE_ACCOUNT not found in environment. Real-time notifications will be disabled.');
      }
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin SDK', error);
    }
  }

  async sendToUser(userId: string, title: string, body: string, data?: any) {
    if (!this.firebaseApp) {
      this.logger.warn(`Firebase not initialized. Skipping notification for user ${userId}`);
      return;
    }

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user || !user.fcmToken) {
      this.logger.debug(`User ${userId} has no FCM token. Skipping push notification.`);
      return;
    }

    const message: admin.messaging.Message = {
      token: user.fcmToken,
      notification: {
        title,
        body,
      },
      data: data || {},
      webpush: {
        notification: {
          icon: '/favicon.png', // Assuming favicon is at root
          badge: '/favicon.png',
        },
      },
    };

    console.log(`[DEBUG FCM] Attempting to send message to user ${userId} with token ${user.fcmToken.substring(0, 10)}...`);

    try {
      const response = await admin.messaging().send(message);
      this.logger.log(`Notification sent to user ${userId}. Response: ${response}`);
      console.log(`[DEBUG FCM] Success! Message ID: ${response}`);
    } catch (error) {
      this.logger.error(`Error sending notification to user ${userId}`, error);
      console.error(`[DEBUG FCM] Failed to send:`, error);
      
      // If token is invalid or expired, remove it from DB
      if (error.code === 'messaging/registration-token-not-registered' || 
          error.code === 'messaging/invalid-registration-token') {
        this.logger.warn(`Removing invalid FCM token for user ${userId}`);
        await this.userRepo.update(userId, { fcmToken: null });
      }
    }
  }
}
