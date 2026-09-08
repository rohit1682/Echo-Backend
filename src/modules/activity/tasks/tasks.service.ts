import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskDocument } from '../schemas/task.schema';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';

@Injectable()
export class TasksService {
  constructor(@InjectModel(Task.name) private readonly model: Model<TaskDocument>) {}

  create(userId: string, dto: CreateTaskDto): Promise<TaskDocument> {
    return this.model.create({
      ...dto,
      userId: new Types.ObjectId(userId),
      tags: (dto.tags ?? []).map((t) => new Types.ObjectId(t)),
    });
  }

  list(userId: string): Promise<TaskDocument[]> {
    return this.model
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ completed: 1, dueDate: 1, createdAt: -1 })
      .populate('tags')
      .exec();
  }

  async update(userId: string, id: string, dto: UpdateTaskDto): Promise<TaskDocument> {
    const update: Record<string, any> = { ...dto };
    if (dto.tags) update.tags = dto.tags.map((t) => new Types.ObjectId(t));
    if (dto.completed !== undefined) {
      update.completedAt = dto.completed ? new Date() : null;
    }
    const doc = await this.model
      .findOneAndUpdate(
        { _id: id, userId: new Types.ObjectId(userId) },
        { $set: update },
        { new: true },
      )
      .exec();
    if (!doc) throw new NotFoundException('Task not found');
    return doc;
  }

  async remove(userId: string, id: string): Promise<void> {
    const res = await this.model.deleteOne({ _id: id, userId: new Types.ObjectId(userId) }).exec();
    if (res.deletedCount === 0) throw new NotFoundException('Task not found');
  }
}
