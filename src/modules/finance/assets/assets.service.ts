import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Asset, AssetDocument } from './schemas/asset.schema';
import { CreateAssetDto, UpdateAssetDto } from './dto/asset.dto';

@Injectable()
export class AssetsService {
  constructor(@InjectModel(Asset.name) private readonly model: Model<AssetDocument>) {}

  create(userId: string, dto: CreateAssetDto): Promise<AssetDocument> {
    return this.model.create({
      ...dto,
      userId: new Types.ObjectId(userId),
      tags: (dto.tags ?? []).map((t) => new Types.ObjectId(t)),
    });
  }

  list(userId: string): Promise<AssetDocument[]> {
    return this.model.find({ userId }).sort({ createdAt: -1 }).populate('tags').exec();
  }

  async update(userId: string, id: string, dto: UpdateAssetDto): Promise<AssetDocument> {
    const update: Record<string, any> = { ...dto };
    if (dto.tags) update.tags = dto.tags.map((t) => new Types.ObjectId(t));
    const doc = await this.model
      .findOneAndUpdate({ _id: id, userId }, { $set: update }, { new: true })
      .exec();
    if (!doc) throw new NotFoundException('Asset not found');
    return doc;
  }

  async remove(userId: string, id: string): Promise<void> {
    const res = await this.model.deleteOne({ _id: id, userId }).exec();
    if (res.deletedCount === 0) throw new NotFoundException('Asset not found');
  }

  findAllForUser(userId: string): Promise<AssetDocument[]> {
    return this.model.find({ userId: new Types.ObjectId(userId) }).exec();
  }
}
