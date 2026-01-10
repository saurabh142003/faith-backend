import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { Follow, FollowDocument } from '../follows/schemas/follow.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { CommentDto } from './dto/comment.dto';
import { Role } from '../common/enums/role.enum';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/schemas/notification.schema';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Follow.name) private followModel: Model<FollowDocument>,
    private notificationsService: NotificationsService,
  ) {}

  async create(userId: string, createPostDto: CreatePostDto) {
    const post = await this.postModel.create({
      ...createPostDto,
      authorId: new Types.ObjectId(userId),
    });

    // Notify followers about new post
    const followers = await this.followModel.find({
      leaderId: new Types.ObjectId(userId),
    });

    for (const follow of followers) {
      await this.notificationsService.create(
        follow.worshiperId.toString(),
        NotificationType.NEW_POST,
        'New Post',
        'A leader you follow has posted something new',
        post._id.toString(),
      );
    }

    return post;
  }

  async findAll() {
    return this.postModel
      .find()
      .populate('authorId', 'name profilePhoto role')
      .sort({ createdAt: -1 });
  }

  async findFollowing(userId: string) {
    // Get all leaders the user follows
    const follows = await this.followModel.find({
      worshiperId: new Types.ObjectId(userId),
    });

    const leaderIds = follows.map((follow) => follow.leaderId);

    // Get posts from followed leaders
    return this.postModel
      .find({ authorId: { $in: leaderIds } })
      .populate('authorId', 'name profilePhoto role')
      .sort({ createdAt: -1 });
  }

  async findOne(id: string) {
    const post = await this.postModel
      .findById(id)
      .populate('authorId', 'name profilePhoto role');
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  async likePost(postId: string, userId: string) {
    const post = await this.findOne(postId);
    const userIdObj = new Types.ObjectId(userId);
    const isLiked = post.likes.some((id) => id.toString() === userId);

    if (isLiked) {
      // Unlike
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId,
      ) as Types.ObjectId[];
    } else {
      // Like
      post.likes.push(userIdObj);
      // Notify post author (if not self-like)
      if (post.authorId.toString() !== userId) {
        await this.notificationsService.create(
          post.authorId.toString(),
          NotificationType.LIKE,
          'New Like',
          'Someone liked your post',
          postId,
        );
      }
    }

    return post.save();
  }

  async commentPost(postId: string, userId: string, commentDto: CommentDto) {
    const post = await this.findOne(postId);
    post.comments.push({
      userId: new Types.ObjectId(userId),
      text: commentDto.text,
      createdAt: new Date(),
    });

    // Notify post author (if not self-comment)
    if (post.authorId.toString() !== userId) {
      await this.notificationsService.create(
        post.authorId.toString(),
        NotificationType.COMMENT,
        'New Comment',
        'Someone commented on your post',
        postId,
      );
    }

    return post.save();
  }

  async savePost(postId: string, userId: string) {
    const post = await this.findOne(postId);
    const userIdObj = new Types.ObjectId(userId);

    if (post.savedBy.some((id) => id.toString() === userId)) {
      // Unsave
      post.savedBy = post.savedBy.filter(
        (id) => id.toString() !== userId,
      ) as Types.ObjectId[];
    } else {
      // Save
      post.savedBy.push(userIdObj);
    }

    return post.save();
  }
}

