import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailboxService } from './mailbox.service';
import { MailboxController } from './mailbox.controller';
import { MailboxEntity } from '../database/entities/mailbox.entity';
import { StudentEntity } from '../database/entities/student.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MailboxEntity, StudentEntity]),
    NotificationsModule,
  ],
  controllers: [MailboxController],
  providers: [MailboxService],
})
export class MailboxModule {}
