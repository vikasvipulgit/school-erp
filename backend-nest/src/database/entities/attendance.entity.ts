import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('attendance')
export class AttendanceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ name: 'class_id', length: 20 })
  classId: string;

  @Column({ length: 10 })
  section: string;

  @Column({ name: 'subject_id', length: 20 })
  subjectId: string;

  @Column({ name: 'teacher_id', length: 20 })
  teacherId: string;

  @Column({ name: 'period_id', length: 20, nullable: true })
  periodId: string;

  @Column({ name: 'marked_by' })
  markedBy: string;

  @Column({ name: 'marked_at', type: 'timestamptz' })
  markedAt: Date;

  // Array of { studentId: string, status: 'present' | 'absent' | 'late' }
  @Column({ type: 'jsonb', nullable: true })
  records: Record<string, any>[];

  @Column({ name: 'school_id', default: 'school_001', length: 50 })
  schoolId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
