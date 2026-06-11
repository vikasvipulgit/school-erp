import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { ReportEntity } from '../database/entities/report.entity';
import { TaskAssignmentEntity } from '../database/entities/task-assignment.entity';
import { ProxyAssignmentEntity } from '../database/entities/proxy-assignment.entity';
import { AcademicYearsModule } from '../academic-years/academic-years.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReportEntity, TaskAssignmentEntity, ProxyAssignmentEntity]),
    AcademicYearsModule,
  ],
  providers: [ReportsService],
  controllers: [ReportsController],
  exports: [ReportsService],
})
export class ReportsModule {}
