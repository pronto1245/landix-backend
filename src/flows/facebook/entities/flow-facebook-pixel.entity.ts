import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';

import { Flow } from '../../entities/flow.entity';

@Entity('flow_facebook_pixel')
@Index(['flowId'])
@Index(['flowId', 'pixelId'], { unique: true })
export class FlowFacebookPixel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  flowId: string;

  @Column({ type: 'varchar', length: 32 })
  pixelId: string;

  @Column({ type: 'text' })
  token: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Flow, (flow) => flow.facebookPixels, {
    onDelete: 'CASCADE'
  })
  flow: Flow;
}
