import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimetableService } from './timetable.service';
import { TimetableController } from './timetable.controller';
import { TimetableEntity } from '../database/entities/timetable.entity';
import { TimetableSettingsEntity } from '../database/entities/timetable-settings.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TimetableEntity, TimetableSettingsEntity])],
  providers: [TimetableService],
  controllers: [TimetableController],
  exports: [TimetableService],
})
export class TimetableModule {}
