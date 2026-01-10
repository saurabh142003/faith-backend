import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Notification,
  NotificationDocument,
  NotificationType,
} from './schemas/notification.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async findAll(userId: string) {
    return this.notificationModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 });
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.notificationModel.findOne({
      _id: notificationId,
      userId: new Types.ObjectId(userId),
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.read = true;
    return notification.save();
  }

  async create(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    relatedId?: string,
  ) {
    return this.notificationModel.create({
      userId: new Types.ObjectId(userId),
      type,
      title,
      message,
      relatedId: relatedId ? new Types.ObjectId(relatedId) : null,
    });
  }
}

