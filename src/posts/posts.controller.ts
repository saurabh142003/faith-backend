import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { CommentDto } from './dto/comment.dto';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.LEADER)
  async create(@CurrentUser() user: any, @Body() createPostDto: CreatePostDto) {
    return this.postsService.create(user._id, createPostDto);
  }

  @Get('explore')
  async explore() {
    return this.postsService.findAll();
  }

  @Get('following')
  async following(@CurrentUser() user: any) {
    return this.postsService.findFollowing(user._id);
  }

  @Post(':id/like')
  async like(@Param('id') id: string, @CurrentUser() user: any) {
    return this.postsService.likePost(id, user._id);
  }

  @Post(':id/comment')
  async comment(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() commentDto: CommentDto,
  ) {
    return this.postsService.commentPost(id, user._id, commentDto);
  }

  @Post(':id/save')
  async save(@Param('id') id: string, @CurrentUser() user: any) {
    return this.postsService.savePost(id, user._id);
  }
}

