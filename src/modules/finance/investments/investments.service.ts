import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Investment, InvestmentDocument } from './schemas/investment.schema';
import {
  CreateInvestmentDto,
  QueryInvestmentsDto,
  UpdateInvestmentDto,
} from './dto/investment.dto';

export interface PaginatedInvestments {
  items: InvestmentDocument[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class InvestmentsService {
  constructor(@InjectModel(Investment.name) private readonly model: Model<InvestmentDocument>) {}

  private toObjectIds(ids?: string[]): Types.ObjectId[] {
    return (ids ?? []).map((id) => new Types.ObjectId(id));
  }

  async create(userId: string, dto: CreateInvestmentDto): Promise<InvestmentDocument> {
    return this.model.create({
      ...dto,
      userId: new Types.ObjectId(userId),
      tags: this.toObjectIds(dto.tags),
    });
  }

  async findAll(userId: string, query: QueryInvestmentsDto): Promise<PaginatedInvestments> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const filter: FilterQuery<InvestmentDocument> = { userId: new Types.ObjectId(userId) };
    if (query.type) filter.type = query.type;
    if (query.status) filter.status = query.status;
    if (query.tag) filter.tags = new Types.ObjectId(query.tag);

    const [items, total] = await Promise.all([
      this.model
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('tags')
        .exec(),
      this.model.countDocuments(filter).exec(),
    ]);

    return { items, total, page, limit };
  }

  async findOne(userId: string, id: string): Promise<InvestmentDocument> {
    const doc = await this.model
      .findOne({ _id: id, userId: new Types.ObjectId(userId) })
      .populate('tags')
      .exec();
    if (!doc) throw new NotFoundException('Investment not found');
    return doc;
  }

  async update(userId: string, id: string, dto: UpdateInvestmentDto): Promise<InvestmentDocument> {
    const update: Record<string, any> = { ...dto };
    if (dto.tags) update.tags = this.toObjectIds(dto.tags);
    const doc = await this.model
      .findOneAndUpdate(
        { _id: id, userId: new Types.ObjectId(userId) },
        { $set: update },
        { new: true },
      )
      .populate('tags')
      .exec();
    if (!doc) throw new NotFoundException('Investment not found');
    return doc;
  }

  async remove(userId: string, id: string): Promise<void> {
    const res = await this.model.deleteOne({ _id: id, userId: new Types.ObjectId(userId) }).exec();
    if (res.deletedCount === 0) throw new NotFoundException('Investment not found');
  }

  /** Raw list used by the dashboard and advisor aggregations. */
  findAllForUser(userId: string): Promise<InvestmentDocument[]> {
    return this.model.find({ userId: new Types.ObjectId(userId) }).exec();
  }
}
