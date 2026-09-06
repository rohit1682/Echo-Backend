import { Controller, Get, Post, Query } from '@nestjs/common';
import { NetWorthService } from './networth.service';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@Controller('finance/networth')
export class NetWorthController {
  constructor(private readonly networth: NetWorthService) {}

  @Get()
  current(@CurrentUser('userId') userId: string) {
    return this.networth.compute(userId);
  }

  @Get('history')
  history(@CurrentUser('userId') userId: string, @Query('limit') limit?: string) {
    return this.networth.history(userId, limit ? parseInt(limit, 10) : 90);
  }

  /** Capture a fresh net-worth data point (used by a scheduled job later). */
  @Post('snapshot')
  snapshot(@CurrentUser('userId') userId: string) {
    return this.networth.captureSnapshot(userId);
  }
}
