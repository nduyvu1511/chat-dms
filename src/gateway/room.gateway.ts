import { WebsocketEmitEvents, WebsocketOnEvents } from '@common/constant'
import { compareTwoObjectId } from '@common/helpers'
import { RoomIdDto } from '@conversation/dtos'
import { MessageService, RoomService } from '@conversation/services'
import { RoomTypingRes } from '@conversation/types'
import { Logger, UseGuards } from '@nestjs/common'
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WsException,
} from '@nestjs/websockets'
import { UserService } from '@user/services'
import { Socket } from 'socket.io'
import { WsGuard } from './ws.guard'

@WebSocketGateway()
export class RoomGateway {
  constructor(
    private roomService: RoomService,
    private messageService: MessageService,
    private userService: UserService
  ) {}

  private readonly logger = new Logger('socket')

  @UseGuards(WsGuard)
  @SubscribeMessage(WebsocketOnEvents.JOIN_ROOM)
  async onJoinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: RoomIdDto
  ): Promise<void> {
    try {
      const user_id = socket.data._id
      const { room_id } = body
      if (!room_id) {
        throw new WsException('Missing room id')
      }
      console.log('new client joined room with id: ', socket.id)
      socket.join(room_id)

      const room = await this.roomService.getRoomById(room_id)
      if (!room) return

      const user = room.members?.find((item) => compareTwoObjectId(item.user_id, user_id))
      if (user?.message_unreads?.length) {
        socket.emit(WebsocketEmitEvents.READ_ALL_MESSAGE, { room_id })
        this.roomService.deleteAllMsgUnreadOfUserInRoom(room_id, user.user_id)
        this.messageService.confirmReadAllMessage(room_id, user.user_id)

        // const lastMessage = await this.messageService.getMessageRes(room.last_message, user_id)
        // // only emit if author is currently in this room
        // if (lastMessage?.author_socket_id && Array.from(socket.rooms)?.[1] === room_id) {
        //   socket
        //     .to(lastMessage.author_socket_id)
        //     .emit(WebsocketEmitEvents.PARTNER_READ_ALL_MESSAGE, lastMessage)
        // }
      }
    } catch (error) {
      this.logger.error(error)
    }
  }

  @UseGuards(WsGuard)
  @SubscribeMessage(WebsocketOnEvents.LEAVE_ROOM)
  async onLeaveRoom(@ConnectedSocket() socket: Socket, @MessageBody() payload: RoomIdDto) {
    try {
      const room_id = payload.room_id
      socket.leave(room_id)
    } catch (error) {
      this.logger.error(error)
    }
  }

  @UseGuards(WsGuard)
  @SubscribeMessage(WebsocketOnEvents.START_TYPING)
  async onStartTyping(@ConnectedSocket() socket: Socket) {
    try {
      const user = await this.userService.findById(socket.data._id)
      const room_id = Array.from(socket.rooms)?.[1]

      if (user._id && room_id) {
        socket.to(room_id).emit(WebsocketEmitEvents.START_TYPING, {
          room_id,
          user_id: user._id,
          user_name: user.user_name,
        } as RoomTypingRes)
      }
    } catch (error) {
      this.logger.error(error)
    }
  }

  @UseGuards(WsGuard)
  @SubscribeMessage(WebsocketOnEvents.STOP_TYPING)
  async onStopTyping(@ConnectedSocket() socket: Socket) {
    try {
      const user = await this.userService.findById(socket.data._id)
      const room_id = Array.from(socket.rooms)?.[1]

      if (user._id && room_id) {
        socket.to(room_id).emit(WebsocketEmitEvents.STOP_TYPING, {
          room_id,
          user_id: user._id,
          user_name: user.user_name,
        } as RoomTypingRes)
      }
    } catch (error) {
      this.logger.error(error)
    }
  }
}
