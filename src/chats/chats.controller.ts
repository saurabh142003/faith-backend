import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('chats')
@UseGuards(JwtAuthGuard)
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post()
  async create(
    @CurrentUser() user: any,
    @Body() createChatDto: CreateChatDto,
  ) {
    return this.chatsService.create(user._id, createChatDto);
  }

  @Get()
  async findAll(@CurrentUser() user: any) {
    return this.chatsService.findAll(user._id, user.role);
  }
}

