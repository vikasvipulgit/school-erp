import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

export enum FeedbackType {
  APPRECIATION = 'appreciation',
  WARNING = 'warning',
  SUGGESTION = 'suggestion',
  GENERAL = 'general',
}

@Entity('feedback')
export class FeedbackEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  message: string;

  @Column({
    type: 'varchar',
    default: FeedbackType.GENERAL,
  })
  type: FeedbackType;

  @Column({ type: 'int', nullable: true })
  rating: number;

  @Column({ name: 'principal_id' })
  principalId: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'principal_id' })
  principal: UserEntity;

  @Column({ name: 'teacher_id' })
  teacherId: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'teacher_id' })
  teacher: UserEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
