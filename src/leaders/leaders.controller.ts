import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { LeadersService } from './leaders.service';
import { JwtAuthGuard } from '../common/guards/jwt.guard';

@Controller('leaders')
@UseGuards(JwtAuthGuard)
export class LeadersController {
  constructor(private readonly leadersService: LeadersService) {}

  @Get('explore')
  async explore() {
    return this.leadersService.findAll();
  }

  @Get(':leaderId')
  async findOne(@Param('leaderId') leaderId: string) {
    return this.leadersService.findOne(leaderId);
  }

  @Get(':leaderId/followers')
  async getFollowers(@Param('leaderId') leaderId: string) {
    return this.leadersService.getFollowers(leaderId);
  }
}

