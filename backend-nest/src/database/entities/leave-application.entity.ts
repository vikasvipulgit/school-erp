import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum LeaveStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('leave_applications')
export class LeaveApplicationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'academic_year_id', nullable: true })
  academicYearId: number;

  @Column({
    type: 'varchar',
    name: 'leave_duration',
    default: 'FULL_DAY',
    length: 20
  })
  leaveDuration: string;

  @Column({
    type: 'decimal',
    name: 'deducted_leaves',
    precision: 4,
    scale: 1,
    default: 1
  })
  deductedLeaves: number;

  @Column({ name: 'teacher_id', length: 50, nullable: true })
  teacherId: string;

  @Column({ name: 'student_id', length: 10, nullable: true })
  studentId: string;

  @Column({ name: 'leave_owner_type', length: 10, default: 'teacher' })
  leaveOwnerType: string;

  @Column({ name: 'leave_type', length: 20, default: 'other' })
  leaveType: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate: string;

  @Column({ name: 'end_date', type: 'date' })
  endDate: string;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'varchar', default: LeaveStatus.PENDING })
  status: LeaveStatus;

  @Column({ name: 'submitted_at', type: 'timestamptz' })
  submittedAt: Date;

  @Column({ name: 'approved_at', type: 'timestamptz', nullable: true })
  approvedAt: Date;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy: string;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @Column({ name: 'school_id', default: 'school_001', length: 50 })
  schoolId: string;

  @Column({ name: 'proxy_assigned', default: false })
  proxyAssigned: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
