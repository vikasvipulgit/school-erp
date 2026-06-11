import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageEntity } from '../database/entities/message.entity';
import { TeacherEntity } from '../database/entities/teacher.entity';
import { StudentEntity } from '../database/entities/student.entity';
import { UserEntity } from '../database/entities/user.entity';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MessageEntity, TeacherEntity, StudentEntity, UserEntity]),
    NotificationsModule,
  ],
  controllers: [MessagesController],
  providers: [MessagesService],
})
export class MessagesModule {}
