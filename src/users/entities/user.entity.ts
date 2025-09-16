import { Exclude } from 'class-transformer';
import { Domain } from 'src/domains/entities/domain.entity';
import { FacebookPixel } from 'src/facebook/entities/facebook-pixel.entity';
import { Flow } from 'src/flows/entities/flow.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';

import { UserRole } from '../enums/role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column({ nullable: true })
  password: string;

  @Exclude()
  @Column({ nullable: true })
  googleId: string;

  @Column('decimal', { precision: 18, scale: 8, default: 0 })
  balance: number;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Exclude()
  @Column({ nullable: true, type: 'text' })
  refreshToken: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Flow, (flow) => flow.user)
  flows: Flow[];

  @OneToMany(() => Domain, (domain) => domain.owner)
  domains: Domain[];

  @OneToMany(() => FacebookPixel, (pixel) => pixel.user)
  facebookPixels: FacebookPixel[];
}
