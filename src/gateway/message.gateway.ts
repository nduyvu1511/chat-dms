import { WebsocketEmitEvents, WebsocketOnEvents } from '@common/constant'
import { MessageService, RoomService } from '@conversation/services'
import { MessageRes } from '@conversation/types'
import { Logger, UseGuards } from '@nestjs/common'
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { NotificationService } from '@notification'
import { Server, Socket } from 'socket.io'
import { WsGuard } from './ws.guard'

@WebSocketGateway()
export class MessageGateway {
  private readonly logger = new Logger('socket')
  constructor(
    private roomService: RoomService,
    private messageService: MessageService,
    private notificationService: NotificationService
  ) {}

  @WebSocketServer() server: Server

  afterInit(server: Server) {
    this.server = server
  }

  @UseGuards(WsGuard)
  @SubscribeMessage(WebsocketOnEvents.SEND_MESSAGE)
  async onSendMessage(@ConnectedSocket() socket: Socket, @MessageBody() payload: MessageRes) {
    try {
      socket.to(payload.room_id).emit(WebsocketEmitEvents.RECEIVE_MESSAGE, {
        ...payload,
        is_author: false,
      })

      const socketIds = await this.roomService.getSocketsFromRoom(payload.room_id)
      const partnerSocketIds = socketIds.filter((item) => item.socket_id !== socket.id)
      if (!partnerSocketIds?.length) return

      partnerSocketIds.forEach(async (item) => {
        if (item.socket_id) {
          const room = Array.from(this.server.sockets.adapter.rooms.get(payload.room_id) || [])
          if (!room.includes(item.socket_id)) {
            if (item.device_id) {
              await this.notificationService.createMessageNotification(item.device_id, payload)
            }
            await this.roomService.addMessageUnreadToRoom(payload.id, item.user_id)
            socket
              .to(item.socket_id)
              .emit(WebsocketEmitEvents.RECEIVE_UNREAD_MESSAGE, { ...payload, is_author: false })
          }
        } else {
          if (item.device_id) {
            await this.notificationService.createMessageNotification(item.device_id, payload)
          }
          await this.roomService.addMessageUnreadToRoom(payload.id, item.user_id)
        }
      })
    } catch (error) {
      this.logger.error(error)
    }
  }

  @SubscribeMessage(WebsocketOnEvents.READ_MESSAGE)
  async onReadMessage(@ConnectedSocket() socket: Socket, @MessageBody() payload: MessageRes) {
    try {
      await this.messageService.confirmReadMessage(payload.id, socket.data._id)
      if (payload?.author_socket_id) {
        socket.to(payload.author_socket_id).emit(WebsocketEmitEvents.CONFIRM_READ_MESSAGE, payload)
      }
    } catch (error) {
      this.logger.error(error)
    }
  }
}
