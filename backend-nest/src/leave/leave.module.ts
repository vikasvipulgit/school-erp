import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveService } from './leave.service';
import { LeaveController } from './leave.controller';
import { LeaveApplicationEntity } from '../database/entities/leave-application.entity';
import { ProxyAssignmentEntity } from '../database/entities/proxy-assignment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LeaveApplicationEntity, ProxyAssignmentEntity])],
  providers: [LeaveService],
  controllers: [LeaveController],
  exports: [LeaveService],
})
export class LeaveModule {}
