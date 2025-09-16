// src/landings/entities/landing.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';

@Entity('landing')
export class Landing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  memberId: string | null;

  @Index()
  @Column({ type: 'varchar', length: 200 })
  name: string; // внутр. имя для списка

  @Column({ type: 'varchar', length: 200 })
  title: string; // meta title

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 50 })
  gameType: string; // e.g. 'wheels', 'plinko'...

  @Column({ type: 'varchar', length: 120 })
  template: string; // e.g. '3HotChiliesThree'

  @Column({ type: 'varchar', length: 200 })
  view: string; // e.g. 'landing-pages/3HotChiliesThree'

  @Column({ type: 'varchar', length: 8, default: 'en' })
  locale: string;

  @Column({ type: 'int', default: 1 })
  spins: number;

  @Column({ type: 'jsonb', default: {} })
  sectors: any; // структура как в твоём примере (list[8], шрифты, бонусы, и т.д.)

  @Column({ type: 'jsonb', default: {} })
  effects: any; // модалки/эффекты

  @Column({ type: 'varchar', length: 500, nullable: true })
  redirect: string | null;

  @Column({ type: 'jsonb', default: {} })
  extra: any; // сюда можно сложить всё остальное: pwaName, currency, freeBet и т.д.

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
