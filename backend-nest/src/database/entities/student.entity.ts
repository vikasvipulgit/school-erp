import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('students')
export class StudentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 5 })
  studentId: string;

  @Column({ length: 255 })
  fullName: string;

  @Column({ unique: true, length: 255, nullable: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ length: 100 })
  className: string;

  @Column({ length: 10 })
  section: string;

  @Column({ name: 'refresh_token_hash', nullable: true, type: 'text' })
  refreshTokenHash: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
