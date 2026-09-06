import { Controller, Get, Query } from '@nestjs/common';
import { AdvisorService } from './advisor.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('advisor')
export class AdvisorController {
  constructor(private readonly advisor: AdvisorService) {}

  /** Fresh recommendations computed from the user's current data. */
  @Get('recommendations')
  recommendations(@CurrentUser('userId') userId: string) {
    return this.advisor.getRecommendations(userId);
  }

  /** Previously generated recommendations. */
  @Get('history')
  history(@CurrentUser('userId') userId: string, @Query('limit') limit?: string) {
    return this.advisor.history(userId, limit ? parseInt(limit, 10) : 50);
  }
}
