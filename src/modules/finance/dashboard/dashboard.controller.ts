import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@Controller('finance/dashboard')
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get()
  summary(@CurrentUser('userId') userId: string) {
    return this.dashboard.getSummary(userId);
  }
}
