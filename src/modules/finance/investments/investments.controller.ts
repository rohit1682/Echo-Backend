import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import { InvestmentsService } from './investments.service';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import {
  CreateInvestmentDto,
  QueryInvestmentsDto,
  UpdateInvestmentDto,
} from './dto/investment.dto';

@Controller('finance/investments')
export class InvestmentsController {
  constructor(private readonly investments: InvestmentsService) {}

  @Post()
  create(@CurrentUser('userId') userId: string, @Body() dto: CreateInvestmentDto) {
    return this.investments.create(userId, dto);
  }

  @Get()
  findAll(@CurrentUser('userId') userId: string, @Query() query: QueryInvestmentsDto) {
    return this.investments.findAll(userId, query);
  }

  @Get(':id')
  findOne(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.investments.findOne(userId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateInvestmentDto,
  ) {
    return this.investments.update(userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.investments.remove(userId, id);
  }
}
