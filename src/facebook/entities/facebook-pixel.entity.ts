import { User } from 'src/users/entities/user.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('facebook_pixels')
export class FacebookPixel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @Column()
  pixelId: string;

  @Column()
  token: string;

  @Column({ default: false })
  connected: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
