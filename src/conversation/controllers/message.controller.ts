import { PaginationDto } from '@common/dtos'
import { HttpResponse } from '@common/utils'
import { LikeMessageDto, SendMessageDto, SendMessageTest } from '@conversation/dtos'
import { MessageService } from '@conversation/services'
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { AuthGuard, UserGuard } from '@user/guards'
import { plainToClass } from 'class-transformer'
import { Request } from 'express'

@ApiTags('Message')
@Controller('message')
export class MessageController {
  constructor(private messageService: MessageService) {}

  @Post()
  // @UseGuards(AuthGuard, UserGuard)
  async sendMessage(@Req() request: Request, @Body() params: any) {
    console.log(params)
    return new HttpResponse({ msg: 'hello' })
    try {
      const res = await this.messageService.sendMessage(
        plainToClass(SendMessageDto, params, {
          excludeExtraneousValues: true,
        }),
        request._user
      )
      return new HttpResponse(res)
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async getMessageById(@Req() request: Request, @Param('id') id: string) {
    try {
      const res = await this.messageService.getMessageRes(id, request._user._id)
      return new HttpResponse(res)
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Post(':id/read')
  @UseGuards(AuthGuard)
  async confirmReadMessage(@Req() request: Request, @Param('id') id: string) {
    try {
      const res = await this.messageService.confirmReadMessage(id, request._user._id)
      return new HttpResponse(res, 'Read message successfully')
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Get(':message_id/users_read')
  @UseGuards(AuthGuard)
  async getUsersRead(
    @Req() request: Request,
    @Query() paginationDto: PaginationDto,
    @Param('message_id') message_id: string
  ) {
    try {
      const res = await this.messageService.getUsersReadMessage(
        message_id,
        request._user._id,
        plainToClass(PaginationDto, paginationDto, {
          excludeExtraneousValues: true,
        })
      )
      return new HttpResponse(res)
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Post('room/:room_id/read_all')
  @UseGuards(AuthGuard)
  async confirmReadAllMessageInRoom(@Req() request: Request, @Param('room_id') room_id: string) {
    try {
      const res = await this.messageService.confirmReadAllMessage(room_id, request._user._id)
      return new HttpResponse(res, 'Read all message successfully')
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Post('like')
  @UseGuards(AuthGuard)
  async likeMessage(@Req() request: Request, @Body() params: LikeMessageDto) {
    try {
      const res = await this.messageService.likeMessage({
        emotion: params.emotion,
        message_id: params.message_id,
        user_id: request._user._id,
      })
      return new HttpResponse(res, 'liked message')
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Delete('unlike/:message_id')
  @UseGuards(AuthGuard)
  async unlikeMessage(@Req() request: Request, @Param('message_id') message_id: string) {
    try {
      const res = await this.messageService.unlikeMessage({
        message_id: message_id,
        user_id: request._user._id,
      })
      return new HttpResponse(res, 'unliked message')
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Get(':message_id/users_like')
  @UseGuards(AuthGuard)
  async getUsersLikedMessage(
    @Query() params: PaginationDto,
    @Param('message_id') message_id: string
  ) {
    try {
      const res = await this.messageService.getUsersLikedMessage(
        message_id,
        plainToClass(PaginationDto, params, {
          excludeExtraneousValues: true,
        })
      )
      return new HttpResponse(res)
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST)
    }
  }
}
