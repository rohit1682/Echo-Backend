import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Loan, LoanDocument } from './schemas/loan.schema';
import { CreateLoanDto, UpdateLoanDto } from './dto/loan.dto';

@Injectable()
export class LoansService {
  constructor(@InjectModel(Loan.name) private readonly model: Model<LoanDocument>) {}

  create(userId: string, dto: CreateLoanDto): Promise<LoanDocument> {
    return this.model.create({ ...dto, userId: new Types.ObjectId(userId) });
  }

  list(userId: string): Promise<LoanDocument[]> {
    return this.model.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async update(userId: string, id: string, dto: UpdateLoanDto): Promise<LoanDocument> {
    const doc = await this.model
      .findOneAndUpdate({ _id: id, userId }, { $set: dto }, { new: true })
      .exec();
    if (!doc) throw new NotFoundException('Loan not found');
    return doc;
  }

  async remove(userId: string, id: string): Promise<void> {
    const res = await this.model.deleteOne({ _id: id, userId }).exec();
    if (res.deletedCount === 0) throw new NotFoundException('Loan not found');
  }

  findAllForUser(userId: string): Promise<LoanDocument[]> {
    return this.model.find({ userId: new Types.ObjectId(userId) }).exec();
  }
}
