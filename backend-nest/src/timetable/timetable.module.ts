import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimetableService } from './timetable.service';
import { TimetableController } from './timetable.controller';
import { TimetableEntity } from '../database/entities/timetable.entity';
import { TimetableSettingsEntity } from '../database/entities/timetable-settings.entity';
import { TeacherEntity } from '../database/entities/teacher.entity';
import { AcademicYearsModule } from '../academic-years/academic-years.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { UserEntity } from '../database/entities/user.entity';
import { StudentEntity } from '../database/entities/student.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TimetableEntity, TimetableSettingsEntity, TeacherEntity, UserEntity, StudentEntity]),
    AcademicYearsModule,
    NotificationsModule,
  ],
  providers: [TimetableService],
  controllers: [TimetableController],
  exports: [TimetableService],
})
export class TimetableModule {}
