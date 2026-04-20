import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SubjectsModule } from './subjects/subjects.module';
import { TeachersModule } from './teachers/teachers.module';
import { ClassesModule } from './classes/classes.module';
import { RoomsModule } from './rooms/rooms.module';
import { PeriodsModule } from './periods/periods.module';
import { TasksModule } from './tasks/tasks.module';
import { LeaveModule } from './leave/leave.module';
import { TimetableModule } from './timetable/timetable.module';
import { AttendanceModule } from './attendance/attendance.module';
import { FeesModule } from './fees/fees.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    SubjectsModule,
    TeachersModule,
    ClassesModule,
    RoomsModule,
    PeriodsModule,
    TasksModule,
    LeaveModule,
    TimetableModule,
    AttendanceModule,
    FeesModule,
    ReportsModule,
  ],
})
export class AppModule {}
