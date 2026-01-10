import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeadersController } from './leaders.controller';
import { LeadersService } from './leaders.service';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Follow, FollowSchema } from '../follows/schemas/follow.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Follow.name, schema: FollowSchema },
    ]),
  ],
  controllers: [LeadersController],
  providers: [LeadersService],
})
export class LeadersModule {}

