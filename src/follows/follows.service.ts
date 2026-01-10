import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Follow, FollowDocument } from './schemas/follow.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class FollowsService {
  constructor(
    @InjectModel(Follow.name) private followModel: Model<FollowDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async follow(worshiperId: string, leaderId: string) {
    if (worshiperId === leaderId) {
      throw new BadRequestException('Cannot follow yourself');
    }

    const leader = await this.userModel.findById(leaderId);
    if (!leader) {
      throw new NotFoundException('Leader not found');
    }

    if (leader.role !== Role.LEADER) {
      throw new BadRequestException('User is not a leader');
    }

    const existingFollow = await this.followModel.findOne({
      worshiperId: new Types.ObjectId(worshiperId),
      leaderId: new Types.ObjectId(leaderId),
    });

    if (existingFollow) {
      throw new ConflictException('Already following this leader');
    }

    return this.followModel.create({
      worshiperId: new Types.ObjectId(worshiperId),
      leaderId: new Types.ObjectId(leaderId),
    });
  }

  async unfollow(worshiperId: string, leaderId: string) {
    const follow = await this.followModel.findOneAndDelete({
      worshiperId: new Types.ObjectId(worshiperId),
      leaderId: new Types.ObjectId(leaderId),
    });

    if (!follow) {
      throw new NotFoundException('Follow relationship not found');
    }

    return { message: 'Unfollowed successfully' };
  }

  async getFollowing(worshiperId: string) {
    const follows = await this.followModel
      .find({ worshiperId: new Types.ObjectId(worshiperId) })
      .populate('leaderId', 'name profilePhoto bio role')
      .sort({ createdAt: -1 });

    return follows.map((follow) => follow.leaderId);
  }
}

