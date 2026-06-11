import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from './entities/user.entity';
import { SubjectEntity } from './entities/subject.entity';
import { TeacherEntity } from './entities/teacher.entity';
import { SchoolClassEntity } from './entities/class.entity';
import { RoomEntity } from './entities/room.entity';
import { PeriodEntity } from './entities/period.entity';
import { TaskEntity } from './entities/task.entity';
import { TaskAssignmentEntity } from './entities/task-assignment.entity';
import { LeaveApplicationEntity } from './entities/leave-application.entity';
import { ProxyAssignmentEntity } from './entities/proxy-assignment.entity';
import { TimetableEntity } from './entities/timetable.entity';
import { TimetableSettingsEntity } from './entities/timetable-settings.entity';
import { AttendanceEntity } from './entities/attendance.entity';
import { FeeEntity } from './entities/fee.entity';
import { ReportEntity } from './entities/report.entity';
import { NotificationEntity } from './entities/notification.entity';
import { AcademicYearEntity } from './entities/academic-year.entity';
import { TeacherLeaveBalanceEntity } from './entities/teacher-leave-balance.entity';
import { FeedbackEntity } from './entities/feedback.entity';
import { StudentEntity } from './entities/student.entity';
import { CircularEntity } from './entities/circular.entity';
import { MailboxEntity } from './entities/mailbox.entity';
import { AchievementEntity } from './entities/achievement.entity';
import { MessageEntity } from './entities/message.entity';

const ALL_ENTITIES = [
  UserEntity,
  SubjectEntity,
  TeacherEntity,
  SchoolClassEntity,
  RoomEntity,
  PeriodEntity,
  TaskEntity,
  TaskAssignmentEntity,
  LeaveApplicationEntity,
  ProxyAssignmentEntity,
  TimetableEntity,
  TimetableSettingsEntity,
  AttendanceEntity,
  FeeEntity,
  ReportEntity,
  NotificationEntity,
  AcademicYearEntity,
  TeacherLeaveBalanceEntity,
  FeedbackEntity,
  StudentEntity,
  CircularEntity,
  MailboxEntity,
  AchievementEntity,
  MessageEntity,
];

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.get<string>('DATABASE_URL');
        const baseOptions = {
          type: 'postgres' as const,
          entities: ALL_ENTITIES,
          synchronize: config.get('NODE_ENV') !== 'production',
          logging: config.get('NODE_ENV') === 'development',
          ssl:
            config.get('NODE_ENV') === 'production'
              ? { rejectUnauthorized: false }
              : false,
        };

        if (url) {
          return {
            ...baseOptions,
            url,
          };
        }

        return {
          ...baseOptions,
          host: config.get<string>('DB_HOST', 'localhost'),
          port: config.get<number>('DB_PORT', 5432),
          username: config.get<string>('DB_USERNAME', 'postgres'),
          password: config.get<string>('DB_PASSWORD', 'postgres'),
          database: config.get<string>('DB_NAME', 'school_erp'),
        };
      },
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
