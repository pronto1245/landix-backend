import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';
import { BalanceModule } from './balance/balance.module';
import { CryptoModule } from './crypto/crypto.module';
import { DomainsModule } from './domains/domains.module';
import { FacebookModule } from './facebook/facebook.module';
import { FlowsModule } from './flows/flows.module';
import { LandingModule } from './landing/landing.module';
import { RedisModule } from './redis/redis.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    RedisModule,
    AuthModule,
    UsersModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('POSTGRES_HOST'),
        port: config.get<number>('POSTGRES_PORT'),
        username: config.get<string>('POSTGRES_USER'),
        password: config.get<string>('POSTGRES_PASSWORD'),
        database: config.get<string>('POSTGRES_DB'),
        synchronize: true,
        autoLoadEntities: true
      })
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 10
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 30
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100
      }
    ]),
    FlowsModule,
    DomainsModule,
    FacebookModule,
    LandingModule,
    CryptoModule,
    BalanceModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
