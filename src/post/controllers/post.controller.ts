import { HttpResponse } from '@common/utils'
import { SendMessageDto } from '@conversation/dtos'
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { CreatePostDto, GetPostsQueryDto, UpdatePostDto } from '@post/dtos'
import { PostService } from '@post/services'
import { AuthGuard, UserGuard } from '@user/guards'
import { plainToClass } from 'class-transformer'
import { Request } from 'express'

@ApiTags('Post')
@Controller('post')
export class PostController {
  constructor(private postService: PostService) {}

  @Post()
  @UseGuards(AuthGuard, UserGuard)
  async createPost(@Req() request: Request, @Body() params: CreatePostDto) {
    try {
      const res = await this.postService.createPost(
        plainToClass(CreatePostDto, params, { excludeExtraneousValues: true }),
        request._user
      )

      return new HttpResponse(res, 'Create post successfully')
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Get()
  async getPosts(@Query() params: GetPostsQueryDto) {
    try {
      const res = await this.postService.getPosts(params)
      return new HttpResponse(res)
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Get(':id')
  async getPostById(@Param('id') id: string) {
    try {
      const res = await this.postService.getPostById(id)
      return new HttpResponse(res)
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Get('/slug/:slug')
  async getPostBySlug(@Param('slug') slug: string) {
    try {
      const res = await this.postService.getPostBySlug(slug)
      return new HttpResponse(res)
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async deletePost(@Param('id') id: string, @Query() params: UpdatePostDto) {
    try {
      const res = await this.postService.updatePost(id, params)
      return new HttpResponse(res)
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Patch(':id/restore')
  @UseGuards(AuthGuard)
  async restorePost(@Param('id') id: string) {
    try {
      const res = await this.postService.restorePost(id)
      return new HttpResponse(res)
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  async updatePost(@Param('id') id: string, @Query() params: UpdatePostDto) {
    try {
      const res = await this.postService.updatePost(id, params)
      return new HttpResponse(res)
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST)
    }
  }
}
