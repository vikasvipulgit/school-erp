import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

@Entity('teacher_leave_balances')
@Unique(['teacherId', 'academicYearId'])
export class TeacherLeaveBalanceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'teacher_id', length: 50 })
  teacherId: string;

  @Column({ name: 'academic_year_id' })
  academicYearId: number;

  @Column({
    type: 'decimal',
    name: 'total_leaves',
    precision: 5,
    scale: 1,
    default: 20
  })
  totalLeaves: number;

  @Column({
    type: 'decimal',
    name: 'used_leaves',
    precision: 5,
    scale: 1,
    default: 0
  })
  usedLeaves: number;

  @Column({
    type: 'decimal',
    name: 'remaining_leaves',
    precision: 5,
    scale: 1,
    default: 20
  })
  remainingLeaves: number;

  @Column({ name: 'school_id', default: 'school_001', length: 50 })
  schoolId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
