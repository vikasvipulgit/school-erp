import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('rooms')
export class RoomEntity {
  @PrimaryColumn({ length: 20 })
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ default: 30 })
  capacity: number;

  @Column({ name: 'school_id', default: 'school_001', length: 50 })
  schoolId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
