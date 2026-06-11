import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum MailboxCategory {
  GENERAL = 'General',
  EXAMINATION = 'Examination',
  ACCOUNTS = 'Accounts',
  SPORTS = 'Sports',
  LIBRARY = 'Library',
  PRINCIPAL_OFFICE = 'Principal Office',
}

@Entity('mailbox_messages')
export class MailboxEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ name: 'sender_name', length: 255 })
  senderName: string;

  @Column({ name: 'sender_role', length: 50 })
  senderRole: string;

  @Column({ type: 'varchar', default: MailboxCategory.GENERAL })
  category: string;

  @Column({ name: 'is_published', default: true })
  isPublished: boolean;

  @Column({ name: 'school_id', default: 'school_001', length: 50 })
  schoolId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
