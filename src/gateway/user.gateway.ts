import { WebsocketEmitEvents } from '@common/constant'
import { compareTwoObjectId } from '@common/helpers'
import { Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { UserService } from '@user/services'
import { FriendStatusRes, User } from '@user/types'
import { Server, Socket } from 'socket.io'

@WebSocketGateway()
export class UserGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  constructor(private userService: UserService, private readonly jwtService: JwtService) {}
  private readonly logger = new Logger('socket')
  @WebSocketServer() server: Server

  afterInit(server: Server) {
    this.server = server
  }

  async handleDisconnect(socket: Socket) {
    try {
      const user = await this.userService.removeSocket(socket.id)
      if (!user?.user_id) return

      const users = await this.userService.getSocketsByUsers(user.friends)
      if (!users?.length) return

      users.forEach((item) => {
        if (!compareTwoObjectId(item.user_id, user._id) && item.socket_id) {
          const room_ids = item.room_joineds?.filter((rId) =>
            user.room_joineds?.some((_id) => compareTwoObjectId(_id, rId))
          )

          socket.to(item.socket_id).emit(WebsocketEmitEvents.FRIEND_LOGOUT, {
            room_ids,
            user_id: user._id,
          } as FriendStatusRes)
        }
      })
    } catch (error) {
      this.logger.error(error?.message)
    }
  }

  async handleConnection(socket: Socket) {
    const token = socket.handshake.headers.authorization?.split(' ')[1]

    try {
      const authUser = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      }) as User

      const user = await this.userService.addSocketToUser(authUser._id, socket.id)
      if (!user) return

      const userRes = await this.userService.getUserInfoByUser(user)
      socket.emit(WebsocketEmitEvents.LOGIN, userRes)

      const users = await this.userService.getSocketsByUsers(user.friends)
      if (!users?.length) return

      users.forEach((item) => {
        if (!compareTwoObjectId(item.user_id, user._id) && item.socket_id) {
          const room_ids = item.room_joineds?.filter((rId) =>
            user.room_joineds?.some((_id) => _id.toString() === rId.toString())
          )

          socket.to(item.socket_id).emit(WebsocketEmitEvents.FRIEND_LOGIN, {
            room_ids,
            user_id: user._id,
          } as FriendStatusRes)
        }
      })
    } catch (error) {
      this.logger.error(error)
    }
  }
}
