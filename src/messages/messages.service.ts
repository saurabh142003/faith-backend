import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Message, MessageDocument } from "./schemas/message.schema";
import { Chat, ChatDocument } from "../chats/schemas/chat.schema";
import { CreateMessageDto } from "./dto/create-message.dto";
import { NotificationsService } from "../notifications/notifications.service";
import { NotificationType } from "../notifications/schemas/notification.schema";

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
    private notificationsService: NotificationsService
  ) {}

  async create(userId: string, createMessageDto: CreateMessageDto) {
    // Verify chat exists and user is part of it
    const chat = await this.chatModel.findById(createMessageDto.chatId);
    if (!chat) {
      throw new NotFoundException("Chat not found");
    }

    if (
      chat.worshiperId.toString() !== userId.toString() &&
      chat.leaderId.toString() !== userId.toString()
    ) {
      throw new ForbiddenException("You do not have access to this chat");
    }

    const message = await this.messageModel.create({
      ...createMessageDto,
      senderId: new Types.ObjectId(userId),
    });

    // Update chat's lastMessage and updatedAt
    await this.chatModel.findByIdAndUpdate(createMessageDto.chatId, {
      lastMessage: createMessageDto.text,
      updatedAt: new Date(),
    });

    // Notify the other participant
    const recipientId =
      chat.worshiperId.toString() === userId
        ? chat.leaderId.toString()
        : chat.worshiperId.toString();

    await this.notificationsService.create(
      recipientId,
      NotificationType.NEW_MESSAGE,
      "New Message",
      "You have a new message",
      createMessageDto.chatId
    );

    return message.populate("senderId", "name profilePhoto");
  }

  async findByChatId(chatId: string, userId: string) {
    // Verify chat exists and user is part of it
    const chat = await this.chatModel.findById(chatId);
    if (!chat) {
      throw new NotFoundException("Chat not found");
    }

    if (
      chat.worshiperId.toString() !== userId.toString() &&
      chat.leaderId.toString() !== userId.toString()
    ) {
      throw new ForbiddenException("You do not have access to this chat");
    }

    return this.messageModel
      .find({ chatId: new Types.ObjectId(chatId) })
      .populate("senderId", "name profilePhoto")
      .sort({ createdAt: 1 });
  }
}
