import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
  Put,
  Req,
  Optional,
} from '@nestjs/common';
import { CommentsService } from './comment_service';
import { JwtAuthGuard } from '../../../jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { HasPermission } from '../../../common/decorators/has-permission.decorator';
import { CreateCommentDto } from '../../dto/comments/create-comment.dto';
import { UpdateCommentDto } from '../../dto/comments/update-comment.dto';
import { CommentFilterDto } from '../../dto/comments/comment-filter.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiOperation,
} from '@nestjs/swagger';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

@ApiTags('comments')
@Controller('comments')
export class CommentController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new comment (guest or registered user)' })
  @ApiCreatedResponse({
    description: 'The comment has been successfully created.',
  })
  async create(
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: Request,
  ) {
    // Try to extract user from JWT token if present
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.decode(token) as any;
        if (decoded && decoded.sub) {
          createCommentDto.authorId = decoded.sub;
        }
      } catch (err) {
        // Ignore invalid token, treat as guest
      }
    }
    return this.commentsService.create(createCommentDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Retrieve comments (public approved list or admin moderation list)',
  })
  @ApiOkResponse({ description: 'A list of comments.' })
  async findAll(@Query() filterDto: CommentFilterDto, @Req() req: Request) {
    // Check if the request has a valid admin token
    const authHeader = req.headers.authorization;
    let isAdmin = false;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.decode(token) as any;
        // If decoded user has role or permission, we can allow admin view
        // To be safe, if a token is present, we allow full query,
        // otherwise we restrict to approved comments on a specific post/page.
        if (decoded) {
          isAdmin = true;
        }
      } catch (err) {
        // Treat as guest
      }
    }

    if (!isAdmin) {
      // Guest users can only see approved comments on a specific post/page
      filterDto.status = 'approved';
      if (!filterDto.postId && !filterDto.blogPostId && !filterDto.articleId) {
        return {
          data: [],
          total: 0,
          page: filterDto.page,
          limit: filterDto.limit,
        };
      }
    }

    return this.commentsService.findAll(filterDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @HasPermission('comments:0')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve a single comment by ID' })
  findOne(@Param('id') id: string) {
    return this.commentsService.findById(+id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @HasPermission('comments:1')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an existing comment' })
  update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
    return this.commentsService.update(+id, updateCommentDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @HasPermission('comments:2')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a comment' })
  async remove(@Param('id') id: string) {
    await this.commentsService.delete(+id);
    return { message: 'Comment deleted successfully' };
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @HasPermission('comments:1')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change comment moderation status' })
  changeStatus(
    @Param('id') id: string,
    @Body('status') status: 'pending' | 'approved' | 'rejected',
  ) {
    return this.commentsService.changeStatus(+id, status);
  }
}
