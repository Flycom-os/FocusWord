import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsEmail,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ description: 'The text content of the comment', minLength: 1 })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: 'The name of the guest author', required: false })
  @IsString()
  @IsOptional()
  authorName?: string;

  @ApiProperty({
    description: 'The email of the guest author',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  authorEmail?: string;

  @ApiProperty({
    description: 'The registered user ID as author',
    required: false,
  })
  @IsInt()
  @IsOptional()
  authorId?: number;

  @ApiProperty({
    description: 'The ID of the related general Post',
    required: false,
  })
  @IsInt()
  @IsOptional()
  postId?: number;

  @ApiProperty({
    description: 'The ID of the related Blog Post',
    required: false,
  })
  @IsInt()
  @IsOptional()
  blogPostId?: number;

  @ApiProperty({
    description: 'The ID of the related Article',
    required: false,
  })
  @IsInt()
  @IsOptional()
  articleId?: number;

  @ApiProperty({
    description: 'The parent comment ID for replies',
    required: false,
  })
  @IsInt()
  @IsOptional()
  parentCommentId?: number;
}
