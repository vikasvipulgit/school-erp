import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CircularService } from './circular.service';
import { CircularController } from './circular.controller';
import { CircularEntity } from '../database/entities/circular.entity';
import { StudentEntity } from '../database/entities/student.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CircularEntity, StudentEntity]),
    NotificationsModule,
  ],
  controllers: [CircularController],
  providers: [CircularService],
})
export class CircularsModule {}
