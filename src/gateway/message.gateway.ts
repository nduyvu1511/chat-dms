import { WebsocketEmitEvents, WebsocketOnEvents } from '@common/constant'
import { MessageService, RoomService } from '@conversation/services'
import { MessageRes } from '@conversation/types'
import { toMessageText } from '@conversation/utils'
import { Logger, UseGuards } from '@nestjs/common'
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets'
import { NotificationService } from '@notification'
import { Socket } from 'socket.io'
import { WsGuard } from './ws.guard'

@WebSocketGateway()
export class MessageGateway {
  constructor(
    private roomService: RoomService,
    private messageService: MessageService,
    private notificationService: NotificationService
  ) {}
  private readonly logger = new Logger('socket')

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
        if (item.device_id) {
          const message = toMessageText(payload)
          this.notificationService.createNotification({
            contents: { en: message },
            priority: 10,
            headings: { en: 'Bạn có tin nhắn mới' },
            large_icon: payload.author_avatar,
            include_player_ids: [item.device_id],
            data: payload,
          })
        }

        if (item.socket_id) {
          if (Array.from(socket.rooms)?.[1] !== payload.room_id) {
            await this.roomService.addMessageUnreadToRoom(payload.id, item.user_id)
            socket
              .to(item.socket_id)
              .emit(WebsocketEmitEvents.RECEIVE_UNREAD_MESSAGE, { ...payload, is_author: false })
          }
        } else {
          this.roomService.addMessageUnreadToRoom(payload.id, item.user_id)
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
