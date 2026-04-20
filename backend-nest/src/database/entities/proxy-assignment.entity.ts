import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ProxyStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('proxy_assignments')
export class ProxyAssignmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'leave_application_id', nullable: true })
  leaveApplicationId: string;

  @Column({ name: 'original_teacher_id', length: 20 })
  originalTeacherId: string;

  @Column({ name: 'proxy_teacher_id', length: 20 })
  proxyTeacherId: string;

  @Column({ name: 'class_id', length: 20 })
  classId: string;

  @Column({ name: 'subject_id', length: 20 })
  subjectId: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ name: 'period_id', length: 20, nullable: true })
  periodId: string;

  @Column({ type: 'varchar', default: ProxyStatus.PENDING })
  status: ProxyStatus;

  @Column({ name: 'approved_at', type: 'timestamptz', nullable: true })
  approvedAt: Date;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
