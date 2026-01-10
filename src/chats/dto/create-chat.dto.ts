import { IsString, IsMongoId } from 'class-validator';

export class CreateChatDto {
  @IsMongoId()
  leaderId: string;
}

