import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CreateBudgetDto, UpdateBudgetDto } from './dto/budget.dto';

@Controller('finance/budgets')
export class BudgetsController {
  constructor(private readonly budgets: BudgetsService) {}

  @Get()
  list(@CurrentUser('userId') userId: string) {
    return this.budgets.list(userId);
  }

  @Get('summary')
  summary(@CurrentUser('userId') userId: string) {
    return this.budgets.summary(userId);
  }

  @Post()
  create(@CurrentUser('userId') userId: string, @Body() dto: CreateBudgetDto) {
    return this.budgets.create(userId, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateBudgetDto,
  ) {
    return this.budgets.update(userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.budgets.remove(userId, id);
  }
}
