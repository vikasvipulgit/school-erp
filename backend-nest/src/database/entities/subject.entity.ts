import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('subjects')
export class SubjectEntity {
  @PrimaryColumn({ length: 20 })
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 20 })
  code: string;

  @Column({ name: 'periods_per_week' })
  periodsPerWeek: number;

  @Column({ name: 'is_elective', default: false })
  isElective: boolean;

  @Column('text', { array: true, name: 'grade_level', default: [] })
  gradeLevel: string[];

  @Column({ name: 'school_id', default: 'school_001', length: 50 })
  schoolId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
