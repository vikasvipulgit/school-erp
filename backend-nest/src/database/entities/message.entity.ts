import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('messages')
export class MessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'conversation_id', type: 'uuid' })
  conversationId: string;

  @Column({ name: 'sender_id', length: 50 })
  senderId: string;

  @Column({ name: 'sender_role', length: 20 })
  senderRole: string;

  @Column({ name: 'sender_name', length: 255 })
  senderName: string;

  @Column({ name: 'receiver_id', length: 50 })
  receiverId: string;

  @Column({ name: 'receiver_role', length: 20 })
  receiverRole: string;

  @Column({ name: 'receiver_name', length: 255 })
  receiverName: string;

  @Column({ length: 255 })
  subject: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @Column({ name: 'read_at', type: 'timestamp', nullable: true })
  readAt: Date;

  @Column({ name: 'deleted_by_sender', default: false })
  deletedBySender: boolean;

  @Column({ name: 'deleted_by_receiver', default: false })
  deletedByReceiver: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
