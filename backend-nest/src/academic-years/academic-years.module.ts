import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicYearsService } from './academic-years.service';
import { AcademicYearsController } from './academic-years.controller';
import { AcademicYearEntity } from '../database/entities/academic-year.entity';
import { TeacherEntity } from '../database/entities/teacher.entity';
import { TeacherLeaveBalanceEntity } from '../database/entities/teacher-leave-balance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AcademicYearEntity, TeacherEntity, TeacherLeaveBalanceEntity])],
  providers: [AcademicYearsService],
  controllers: [AcademicYearsController],
  exports: [AcademicYearsService],
})
export class AcademicYearsModule {}
