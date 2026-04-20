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
];

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get('DB_USERNAME', 'postgres'),
        password: config.get('DB_PASSWORD', 'postgres'),
        database: config.get('DB_NAME', 'school_erp'),
        entities: ALL_ENTITIES,
        // Auto-create/update tables in dev; run migrations in prod
        synchronize: config.get('NODE_ENV') !== 'production',
        logging: config.get('NODE_ENV') === 'development',
        ssl:
          config.get('NODE_ENV') === 'production'
            ? { rejectUnauthorized: false }
            : false,
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
