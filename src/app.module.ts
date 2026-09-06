import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';

import configuration from './config/configuration';
import { validateEnv } from './config/env.validation';
import { buildPinoParams } from './config/logger.config';
import { DatabaseModule } from './database/database.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

import { HealthController } from './modules/health/health.controller';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { TagsModule } from './modules/tags/tags.module';
import { InvestmentsModule } from './modules/finance/investments/investments.module';
import { AssetsModule } from './modules/finance/assets/assets.module';
import { LoansModule } from './modules/finance/loans/loans.module';
import { NetWorthModule } from './modules/finance/networth/networth.module';
import { DashboardModule } from './modules/finance/dashboard/dashboard.module';
import { PricesModule } from './modules/prices/prices.module';
import { AdvisorModule } from './modules/advisor/advisor.module';
import { FinanceStubsModule } from './modules/finance/stubs/finance-stubs.module';
import { ActivityStubsModule } from './modules/activity/activity-stubs.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateEnv,
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        buildPinoParams(
          config.get<string>('env', 'development'),
          config.get<string>('env') === 'production' ? 'info' : 'debug',
        ),
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    DatabaseModule,

    // Identity & auth
    UsersModule,
    AuthModule,

    // Finance (one section)
    TagsModule,
    InvestmentsModule,
    AssetsModule,
    LoansModule,
    NetWorthModule,
    DashboardModule,
    PricesModule,
    FinanceStubsModule,

    // AI Advisor
    AdvisorModule,

    // Personal Activity (one section)
    ActivityStubsModule,

    // Cross-cutting
    NotificationsModule,
  ],
  controllers: [HealthController],
  providers: [
    // Global JWT auth (routes opt out with @Public()).
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // Global rate limiting.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
