import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import { AttendanceStatus } from '../../attendance/enums/attendance-status.enum';

@Entity('attendance_records')
@Unique(['studentId', 'date'])
export class AttendanceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'student_id', length: 50 })
  studentId: string;

  @Index()
  @Column({ name: 'class_id', length: 50 })
  classId: string;

  @Column({ length: 10, nullable: true })
  section: string;

  @Index()
  @Column({ type: 'date' })
  date: string;

  @Column({
    type: 'enum',
    enum: AttendanceStatus,
    default: AttendanceStatus.PRESENT,
  })
  status: AttendanceStatus;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @Column({ name: 'marked_by_teacher_id', length: 50, nullable: true })
  markedByTeacherId: string;

  @Column({ name: 'subject_id', length: 50, nullable: true })
  subjectId: string;

  @Column({ name: 'period_id', length: 50, nullable: true })
  periodId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
