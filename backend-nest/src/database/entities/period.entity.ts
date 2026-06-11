import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('periods')
export class PeriodEntity {
  @PrimaryColumn({ length: 20 })
  id: string;

  @Column()
  number: number;

  @Column({ name: 'start_time', length: 10 })
  startTime: string;

  @Column({ name: 'end_time', length: 10 })
  endTime: string;

  @Column({ name: 'is_break', default: false })
  isBreak: boolean;

  @Column({ length: 50 })
  label: string;

  @Column({ name: 'school_id', default: 'school_001', length: 50 })
  schoolId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
