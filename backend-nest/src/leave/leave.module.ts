import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveService } from './leave.service';
import { LeaveController } from './leave.controller';
import { LeaveApplicationEntity } from '../database/entities/leave-application.entity';
import { ProxyAssignmentEntity } from '../database/entities/proxy-assignment.entity';
import { TeacherEntity } from '../database/entities/teacher.entity';
import { UserEntity } from '../database/entities/user.entity';
import { TeacherLeaveBalanceEntity } from '../database/entities/teacher-leave-balance.entity';
import { StudentEntity } from '../database/entities/student.entity';
import { AcademicYearsModule } from '../academic-years/academic-years.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LeaveApplicationEntity,
      ProxyAssignmentEntity,
      TeacherEntity,
      UserEntity,
      TeacherLeaveBalanceEntity,
      StudentEntity,
    ]),
    NotificationsModule,
    AcademicYearsModule
  ],
  providers: [LeaveService],
  controllers: [LeaveController],
  exports: [LeaveService],
})
export class LeaveModule {}
