import { IsString, IsMongoId, MaxLength } from 'class-validator';

export class CreateMessageDto {
  @IsMongoId()
  chatId: string;

  @IsString()
  @MaxLength(2000)
  text: string;
}

