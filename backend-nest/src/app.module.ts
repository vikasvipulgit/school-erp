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
import { NotificationsModule } from './notifications/notifications.module';
import { AcademicYearsModule } from './academic-years/academic-years.module';
import { FeedbackModule } from './feedback/feedback.module';
import { FirebaseModule } from './firebase/firebase.module';
import { EmailModule } from './email/email.module';
import { CircularsModule } from './circulars/circular.module';
import { MailboxModule } from './mailbox/mailbox.module';
import { AchievementsModule } from './achievements/achievements.module';
import { StudentsModule } from './students/students.module';
import { MessagesModule } from './messages/messages.module';
import { AppController } from './app.controller';
import { validate } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate }),
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
    NotificationsModule,
    AcademicYearsModule,
    FeedbackModule,
    FirebaseModule,
    EmailModule,
    CircularsModule,
    MailboxModule,
    AchievementsModule,
    StudentsModule,
    MessagesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
