import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassesService } from './classes.service';
import { ClassesController } from './classes.controller';
import { SchoolClassEntity } from '../database/entities/class.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SchoolClassEntity])],
  providers: [ClassesService],
  controllers: [ClassesController],
  exports: [ClassesService],
})
export class ClassesModule {}
