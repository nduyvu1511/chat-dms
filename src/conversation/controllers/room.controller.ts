import { PaginationDto } from '@common/dtos'
import { HttpResponse } from '@common/utils'
import {
  CreateGroupChatDto,
  CreateSingleChatDto,
  GetRoomsQueryDto,
  MessageIdDto,
  MessageResDto,
  RoomResDto,
  UpdateRoomInfoDto,
} from '@conversation/dtos'
import { MessageService, RoomService } from '@conversation/services'
import { Room } from '@conversation/types'
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
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { AuthGuard, UserGuard, UserIsAdminGuard } from '@user/guards'
import { plainToClass } from 'class-transformer'
import { Request } from 'express'

@ApiTags('Room')
@Controller('room')
export class RoomController {
  constructor(
    private readonly roomService: RoomService,
    private readonly messageService: MessageService
  ) {}

  @Get(':room_id/messages')
  @UseGuards(AuthGuard, UserGuard)
  @ApiOkResponse({ type: MessageResDto })
  async getMessagesInRoom(
    @Query() paginationDto: PaginationDto,
    @Req() request: Request,
    @Param('room_id') room_id: string
  ) {
    try {
      const params = plainToClass(GetRoomsQueryDto, paginationDto, {
        excludeExtraneousValues: true,
      })

      const messages = await this.messageService.getMessagesByFilter({
        limit: params.limit,
        offset: params.offset,
        filter: { room_id },
        user_id: request._user._id,
      })
      return new HttpResponse(messages)
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Get()
  @ApiOkResponse({ type: RoomResDto })
  @UseGuards(AuthGuard, UserGuard)
  async getRooms(@Query() getRoomsQueryDto: GetRoomsQueryDto, @Req() request: Request) {
    try {
      const params = plainToClass(GetRoomsQueryDto, getRoomsQueryDto, {
        excludeExtraneousValues: true,
      })

      const data = await this.roomService.getRooms({
        ...params,
        user: request._user,
      })
      return new HttpResponse(data)
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Get('/:room_id')
  @UseGuards(AuthGuard, UserGuard)
  async getRoomDetail(@Req() request: Request, @Param('room_id') room_id: string) {
    try {
      const res = await this.roomService.getRoomDetail(room_id, request._user)
      return new HttpResponse(res)
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Delete('/:room_id')
  @UseGuards(AuthGuard, UserIsAdminGuard)
  async deleteRoom(@Req() request: Request, @Param('room_id') room_id: string) {
    try {
      const res = await this.roomService.deleteRoom(room_id, request._user)
      return new HttpResponse(res, 'Đã xóa phòng chat')
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Delete('/:room_id/message_unread/:user_id')
  @UseGuards(AuthGuard)
  async deleteAllMsgUnreadFromRoom(
    @Param('room_id') room_id: string,
    @Param('user_id') user_id: string
  ) {
    try {
      const res = await this.roomService.deleteAllMsgUnreadOfUserInRoom(room_id, user_id)
      return new HttpResponse(res, 'Đã xóa tất cả tin nhắn chưa đọc trong phòng chat')
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST)
    }
  }

  async checkRoomExists(room_id: string): Promise<Room> {
    const room = (await this.roomService.getRoomById(room_id)) as Room
    if (!room) {
      throw new HttpException('Room not found', HttpStatus.BAD_REQUEST)
    }

    return room
  }

  @Delete('/:room_id/leave')
  @UseGuards(AuthGuard)
  async leaveRoom(@Param('room_id') room_id: string, @Req() request: Request) {
    try {
      const room = await this.checkRoomExists(room_id)
      const res = await this.roomService.leaveRoom(room, request._user._id)
      return new HttpResponse(res, 'Rời phòng chat thành công')
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Post('/:room_id/join')
  @UseGuards(AuthGuard)
  async joinRoom(@Param('room_id') room_id: string, @Req() request: Request) {
    try {
      const room = await this.checkRoomExists(room_id)
      const res = await this.roomService.joinRoom(room, request._user._id)
      return new HttpResponse(res, 'Tham gia phòng chat thành công')
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Get(':room_id/members')
  @UseGuards(AuthGuard)
  async getMembersInRoom(@Param('room_id') room_id: string, @Query() params: PaginationDto) {
    try {
      const room = (await this.roomService.getRoomById(room_id)) as Room
      if (!room) {
        throw new HttpException('Không tìm thấy phòng chat', HttpStatus.BAD_REQUEST)
      }

      const { limit, offset } = plainToClass(PaginationDto, params, {
        excludeExtraneousValues: true,
      })

      const res = await this.roomService.getMembersInRoom({
        room,
        limit,
        offset,
      })

      return new HttpResponse(res)
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Patch('info/:room_id')
  @UseGuards(AuthGuard)
  async getRoomInfo(@Param('room_id') room_id: string, @Body() body: UpdateRoomInfoDto) {
    try {
      const data = await this.roomService.updateRoomInfo(
        room_id,
        plainToClass(UpdateRoomInfoDto, body, { excludeExtraneousValues: true })
      )
      return new HttpResponse(data)
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Post('single')
  @UseGuards(AuthGuard, UserGuard)
  async createSingleChatRoom(
    @Req() request: Request,
    @Body() createSingleChat: CreateSingleChatDto
  ) {
    try {
      const data = await this.roomService.createSingleChatRoom(
        plainToClass(CreateSingleChatDto, createSingleChat, { excludeExtraneousValues: true }),
        request._user
      )
      return new HttpResponse(data)
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Post('group')
  @UseGuards(AuthGuard, UserGuard)
  async createGroupChatRoom(
    @Req() request: Request,
    @Body() createGroupChatDto: CreateGroupChatDto
  ) {
    try {
      const data = await this.roomService.createGroupChatRoom(
        plainToClass(CreateGroupChatDto, createGroupChatDto, { excludeExtraneousValues: true }),
        request._user
      )
      return new HttpResponse(data)
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Post('/message_unread')
  @UseGuards(AuthGuard)
  async addMessageUnReadToRoom(@Req() request: Request, @Body() { message_id }: MessageIdDto) {
    try {
      const data = await this.roomService.addMessageUnreadToRoom(message_id, request._user._id)
      return new HttpResponse(data)
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST)
    }
  }
}
