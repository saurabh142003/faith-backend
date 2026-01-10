import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @MaxLength(2000)
  text: string;

  @IsOptional()
  @IsString()
  image?: string;
}

