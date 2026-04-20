import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('classes')
export class SchoolClassEntity {
  @PrimaryColumn({ length: 20 })
  id: string;

  @Column({ length: 50 })
  name: string;

  @Column('text', { array: true, default: [] })
  sections: string[];

  @Column({ name: 'school_id', default: 'school_001', length: 50 })
  schoolId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
