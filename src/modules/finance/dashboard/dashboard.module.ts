import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { InvestmentsModule } from '../investments/investments.module';
import { AssetsModule } from '../assets/assets.module';
import { LoansModule } from '../loans/loans.module';
import { NetWorthModule } from '../networth/networth.module';

@Module({
  imports: [InvestmentsModule, AssetsModule, LoansModule, NetWorthModule],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
