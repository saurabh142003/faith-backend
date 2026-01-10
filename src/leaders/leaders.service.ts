import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Follow, FollowDocument } from '../follows/schemas/follow.schema';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class LeadersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Follow.name) private followModel: Model<FollowDocument>,
  ) {}

  async findAll() {
    return this.userModel
      .find({ role: Role.LEADER })
      .select('name profilePhoto bio role')
      .sort({ createdAt: -1 });
  }

  async findOne(leaderId: string) {
    const leader = await this.userModel
      .findById(leaderId)
      .select('name profilePhoto bio role email');
    if (!leader) {
      throw new NotFoundException('Leader not found');
    }
    if (leader.role !== Role.LEADER) {
      throw new NotFoundException('User is not a leader');
    }
    return leader;
  }

  async getFollowers(leaderId: string) {
    const leader = await this.findOne(leaderId);
    const follows = await this.followModel
      .find({ leaderId: new Types.ObjectId(leaderId) })
      .populate('worshiperId', 'name profilePhoto role')
      .sort({ createdAt: -1 });

    return follows.map((follow) => follow.worshiperId);
  }
}

