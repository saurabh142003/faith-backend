import { Controller, Get, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller()
@UseGuards(JwtAuthGuard)
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post('leaders/:id/follow')
  async follow(@Param('id') leaderId: string, @CurrentUser() user: any) {
    return this.followsService.follow(user._id, leaderId);
  }

  @Delete('leaders/:id/unfollow')
  async unfollow(@Param('id') leaderId: string, @CurrentUser() user: any) {
    return this.followsService.unfollow(user._id, leaderId);
  }

  @Get('me/following')
  async getFollowing(@CurrentUser() user: any) {
    return this.followsService.getFollowing(user._id);
  }
}

