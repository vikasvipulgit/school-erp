import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('timetables')
export class TimetableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'academic_year_id', nullable: true })
  academicYearId: number;

  @Column({ name: 'school_id', default: 'school_001', length: 50 })
  schoolId: string;

  @Column({ type: 'jsonb', nullable: true })
  grids: Record<string, any>;

  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt: Date;

  @Column({ name: 'effective_from', type: 'date', nullable: true })
  effectiveFrom: string;

  @Column({ name: 'effective_to', type: 'date', nullable: true })
  effectiveTo: string;

  @Column({ name: 'published_by', nullable: true })
  publishedBy: string;

  @Column({ name: 'class_id', nullable: true })
  classId: string;

  @Column({ type: 'varchar', default: 'draft', length: 20 })
  status: 'draft' | 'published';

  @Column({ name: 'is_active', default: false })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
