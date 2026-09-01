import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';

// Import modules here for visibility
import { HealthModule } from './modules/health/health.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { UsersModule } from './modules/users/user.module';
import { LimitsModule } from './modules/limits/limits.module';
import { TransfersModule } from './modules/transfers/transfers.module';



export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    ObserveModule.forRoot({
      appKey: 'YOUR_APP_KEY',
      appSecret: 'YOUR_APP_SECRET',
      serviceId: 'maya-marquez-martech',
    }),
    HealthModule,
    PrismaModule,
    UsersModule,
    LimitsModule,
    TransfersModule
  ],
  providers: [],
})
export class AppModule {}
