import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  async create(@CurrentUser() user: any, @Body() createMessageDto: CreateMessageDto) {
    return this.messagesService.create(user._id, createMessageDto);
  }

  @Get(':chatId')
  async findByChatId(@Param('chatId') chatId: string, @CurrentUser() user: any) {
    return this.messagesService.findByChatId(chatId, user._id);
  }
}

