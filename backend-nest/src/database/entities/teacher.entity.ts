import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('teachers')
export class TeacherEntity {
  @PrimaryColumn({ length: 20 })
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ name: 'short_name', length: 50 })
  shortName: string;

  @Column({ name: 'employee_code', unique: true, length: 20 })
  employeeCode: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column('text', { array: true, name: 'subject_ids', default: [] })
  subjectIds: string[];

  @Column('text', { array: true, name: 'subject_names', default: [] })
  subjectNames: string[];

  @Column('text', { array: true, name: 'grade_level', default: [] })
  gradeLevel: string[];

  @Column({ name: 'max_periods_day', default: 6 })
  maxPeriodsDay: number;

  @Column({ name: 'max_periods_week', default: 30 })
  maxPeriodsWeek: number;

  @Column({ default: 'active', length: 20 })
  status: string;

  @Column({ name: 'school_id', default: 'school_001', length: 50 })
  schoolId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
