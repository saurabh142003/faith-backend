import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Chat, ChatDocument } from './schemas/chat.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Follow, FollowDocument } from '../follows/schemas/follow.schema';
import { CreateChatDto } from './dto/create-chat.dto';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class ChatsService {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Follow.name) private followModel: Model<FollowDocument>,
  ) {}

  async create(worshiperId: string, createChatDto: CreateChatDto) {
    const leader = await this.userModel.findById(createChatDto.leaderId);
    if (!leader || leader.role !== Role.LEADER) {
      throw new NotFoundException('Leader not found');
    }

    // Check if worshiper follows the leader
    const follow = await this.followModel.findOne({
      worshiperId: new Types.ObjectId(worshiperId),
      leaderId: new Types.ObjectId(createChatDto.leaderId),
    });

    if (!follow) {
      throw new ForbiddenException('You must follow the leader to start a chat');
    }

    // Check if chat already exists
    const existingChat = await this.chatModel.findOne({
      worshiperId: new Types.ObjectId(worshiperId),
      leaderId: new Types.ObjectId(createChatDto.leaderId),
    });

    if (existingChat) {
      return existingChat;
    }

    return this.chatModel.create({
      worshiperId: new Types.ObjectId(worshiperId),
      leaderId: new Types.ObjectId(createChatDto.leaderId),
    });
  }

  async findAll(userId: string, userRole: Role) {
    const query =
      userRole === Role.WORSHIPER
        ? { worshiperId: new Types.ObjectId(userId) }
        : { leaderId: new Types.ObjectId(userId) };

    return this.chatModel
      .find(query)
      .populate('worshiperId', 'name profilePhoto')
      .populate('leaderId', 'name profilePhoto')
      .sort({ updatedAt: -1 });
  }

  async findOne(chatId: string, userId: string) {
    const chat = await this.chatModel
      .findById(chatId)
      .populate('worshiperId', 'name profilePhoto')
      .populate('leaderId', 'name profilePhoto');

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    // Check if user is part of the chat
    if (
      chat.worshiperId._id.toString() !== userId &&
      chat.leaderId._id.toString() !== userId
    ) {
      throw new ForbiddenException('You do not have access to this chat');
    }

    return chat;
  }
}

