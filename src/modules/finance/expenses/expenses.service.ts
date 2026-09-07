import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Expense, ExpenseDocument } from '../stubs/schemas/expense.schema';
import { CreateExpenseDto, UpdateExpenseDto } from './dto/expense.dto';

@Injectable()
export class ExpensesService {
  constructor(@InjectModel(Expense.name) private readonly model: Model<ExpenseDocument>) {}

  create(userId: string, dto: CreateExpenseDto): Promise<ExpenseDocument> {
    return this.model.create({
      ...dto,
      userId: new Types.ObjectId(userId),
      categoryId: dto.categoryId ? new Types.ObjectId(dto.categoryId) : undefined,
      tags: (dto.tags ?? []).map((t) => new Types.ObjectId(t)),
    });
  }

  list(userId: string): Promise<ExpenseDocument[]> {
    return this.model
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ spentAt: -1 })
      .populate('tags')
      .populate('categoryId')
      .exec();
  }

  async update(userId: string, id: string, dto: UpdateExpenseDto): Promise<ExpenseDocument> {
    const update: Record<string, any> = { ...dto };
    if (dto.tags) update.tags = dto.tags.map((t) => new Types.ObjectId(t));
    if (dto.categoryId) update.categoryId = new Types.ObjectId(dto.categoryId);
    const doc = await this.model
      .findOneAndUpdate(
        { _id: id, userId: new Types.ObjectId(userId) },
        { $set: update },
        { new: true },
      )
      .exec();
    if (!doc) throw new NotFoundException('Expense not found');
    return doc;
  }

  async remove(userId: string, id: string): Promise<void> {
    const res = await this.model.deleteOne({ _id: id, userId: new Types.ObjectId(userId) }).exec();
    if (res.deletedCount === 0) throw new NotFoundException('Expense not found');
  }

  /** Expenses on or after `since`, used to compute budget progress. */
  findSince(userId: string, since: Date): Promise<ExpenseDocument[]> {
    return this.model.find({ userId: new Types.ObjectId(userId), spentAt: { $gte: since } }).exec();
  }
}
