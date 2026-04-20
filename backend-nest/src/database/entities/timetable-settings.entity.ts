import {
  Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn,
} from 'typeorm';

@Entity('timetable_settings')
export class TimetableSettingsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'school_id', unique: true, length: 50 })
  schoolId: string;

  @Column({ type: 'jsonb', name: 'period_slots', default: [] })
  periodSlots: object[];

  @Column({ type: 'text', array: true, name: 'working_days', default: [] })
  workingDays: string[];

  @Column({ type: 'jsonb', default: {} })
  rules: object;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
