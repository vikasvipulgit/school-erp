import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TaskEntity } from '../database/entities/task.entity';
import { TaskAssignmentEntity } from '../database/entities/task-assignment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TaskEntity, TaskAssignmentEntity])],
  providers: [TasksService],
  controllers: [TasksController],
  exports: [TasksService],
})
export class TasksModule {}
