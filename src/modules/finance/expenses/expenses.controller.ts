import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CreateExpenseDto, UpdateExpenseDto } from './dto/expense.dto';

@Controller('finance/expenses')
export class ExpensesController {
  constructor(private readonly expenses: ExpensesService) {}

  @Get()
  list(@CurrentUser('userId') userId: string) {
    return this.expenses.list(userId);
  }

  @Post()
  create(@CurrentUser('userId') userId: string, @Body() dto: CreateExpenseDto) {
    return this.expenses.create(userId, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateExpenseDto,
  ) {
    return this.expenses.update(userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.expenses.remove(userId, id);
  }
}
