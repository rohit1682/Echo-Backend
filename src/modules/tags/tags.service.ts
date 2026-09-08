import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Tag, TagDocument } from './schemas/tag.schema';
import { CreateTagDto, UpdateTagDto } from './dto/tag.dto';

@Injectable()
export class TagsService {
  constructor(@InjectModel(Tag.name) private readonly tagModel: Model<TagDocument>) {}

  list(userId: string): Promise<TagDocument[]> {
    return this.tagModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ name: 1 })
      .exec();
  }

  async create(userId: string, dto: CreateTagDto): Promise<TagDocument> {
    try {
      return await this.tagModel.create({ ...dto, userId: new Types.ObjectId(userId) });
    } catch (err: any) {
      if (err?.code === 11000) throw new ConflictException('A tag with this name already exists');
      throw err;
    }
  }

  async update(userId: string, id: string, dto: UpdateTagDto): Promise<TagDocument> {
    const tag = await this.tagModel
      .findOneAndUpdate(
        { _id: id, userId: new Types.ObjectId(userId) },
        { $set: dto },
        { new: true },
      )
      .exec();
    if (!tag) throw new NotFoundException('Tag not found');
    return tag;
  }

  async remove(userId: string, id: string): Promise<void> {
    const res = await this.tagModel
      .deleteOne({ _id: id, userId: new Types.ObjectId(userId) })
      .exec();
    if (res.deletedCount === 0) throw new NotFoundException('Tag not found');
  }
}
