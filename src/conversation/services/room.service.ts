import { WebsocketEmitEvents } from '@common/constant'
import { compareTwoObjectId } from '@common/helpers'
import { ListRes, QueryCommonParams } from '@common/types'
import { toListResponse } from '@common/utils'
import {
  CreateGroupChatDto,
  CreateSingleChatDto,
  GetRoomsQueryDto,
  UpdateRoomInfoDto,
} from '@conversation/dtos'
import { MessageRepository, RoomRepository } from '@conversation/repositories'
import { Room, RoomMemberRes, RoomRes } from '@conversation/types'
import {
  toMessageUnreadCount,
  toRoomMemberListResponse,
  toRoomOfflineAt,
} from '@conversation/utils'
import { UserGateway } from '@gateway/user.gateway'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { UserRepository } from '@user/repositories'
import { User, UserSocketId } from '@user/types'
import * as _ from 'lodash'

@Injectable()
export class RoomService {
  constructor(
    private readonly roomRepository: RoomRepository,
    private readonly userRepository: UserRepository,
    private readonly messageRepository: MessageRepository,
    private readonly websocket: UserGateway
  ) {}

  async createSingleChatRoom({ partner_id }: CreateSingleChatDto, user: User) {
    if (user.user_id === partner_id) {
      throw new HttpException('Không thể tạo phòng chỉ với một người', HttpStatus.BAD_REQUEST)
    }

    const partner = await this.userRepository.getUserByUserId(partner_id)
    if (!partner) {
      throw new HttpException('Không tìm thấy người dùng', HttpStatus.NOT_FOUND)
    }

    // Check partner and user already has room
    const room_id = await this.getRoomIdByUserId(user.room_joineds, partner._id.toString())
    if (room_id) {
      return await this.getRoomDetail(room_id, user)
    }

    const roomCreated = await this.roomRepository.createSingleChatRoom({ partner, user })
    if (!roomCreated) {
      throw new HttpException('Tạo phòng chat lỗi', HttpStatus.BAD_REQUEST)
    }

    this.userRepository.saveRoomToUserIds([partner._id, user._id], roomCreated._id)
    this.userRepository.setFriends([partner._id, user._id], 'add')

    const roomRes = await this.getRoomDetail(roomCreated._id, user)

    if (partner?.socket_id) {
      this.websocket.server?.to(partner.socket_id).emit(WebsocketEmitEvents.CREATE_ROOM, roomRes)
    }

    return roomRes
  }

  async getRoomById(room_id: string) {
    return this.roomRepository.findById(room_id)
  }

  async createGroupChatRoom(
    { member_ids, room_name, room_avatar }: CreateGroupChatDto,
    user: User
  ) {
    const memberIds: number[] = _.uniq([...member_ids, user.user_id])

    if (memberIds?.length < 3) {
      throw new HttpException('Nhóm chat phải có ít nhất 3 người', HttpStatus.BAD_REQUEST)
    }

    const partnerObjectIds = await this.userRepository.getUsersByUserIds(memberIds)
    if (partnerObjectIds?.length < 3) {
      throw new HttpException('Nhóm chat phải có ít nhất 3 người', HttpStatus.BAD_REQUEST)
    }

    const user_ids = partnerObjectIds.map((item) => item._id)
    const room = await this.roomRepository.createGroupChatRoom({
      room_name,
      room_avatar,
      member_ids: user_ids,
    })
    if (!room) {
      throw new HttpException('Create group chat failed', HttpStatus.BAD_REQUEST)
    }

    this.userRepository.saveRoomToUserIds(user_ids, room._id)
    this.userRepository.setFriends(user_ids, 'add')

    const roomRes = await this.getRoomDetail(room._id, user)

    // Emit to client online and except the sender
    partnerObjectIds.forEach((item) => {
      if (!compareTwoObjectId(item._id, user._id) && item?.socket_id) {
        this.websocket.server?.to(item.socket_id)?.emit(WebsocketEmitEvents.CREATE_ROOM, roomRes)
      }
    })

    return roomRes
  }

  async getRoomIdByUserId(room_joineds: string[], partner_id: string): Promise<string | undefined> {
    const room = await this.roomRepository.findOne({
      $and: [{ _id: { $in: room_joineds } }, { room_type: 'single' }, { is_deleted: false }],
    })

    if (room?.members?.some((item) => item.user_id.toString() === partner_id.toString())) {
      return room._id
    }

    return undefined
  }

  async getRooms(params: GetRoomsQueryDto & { user: User }) {
    return await this.roomRepository.findRooms(params)
  }

  async getRoomDetail(room_id: string, user: User): Promise<RoomRes> {
    const room = (await this.roomRepository.findOne({
      $and: [{ _id: room_id }, { is_deleted: false }],
    })) as Room

    if (!room?._id || room.is_deleted) {
      throw new HttpException('Không tìm thấy phòng chat', HttpStatus.NOT_FOUND)
    }

    const top_members = await this.userRepository.getTopMembers(
      (room.members || [])?.map((item) => item.user_id)
    )

    let name: null | string
    let avatar = room?.avatar
    if (room.type === 'group') {
      name = room?.name || top_members.map((item) => item.user_name)?.join(', ')
    } else {
      const partner = top_members?.find((item) => !compareTwoObjectId(item.user_id, user._id))
      name = partner?.user_name || null
      avatar = partner?.avatar || null
    }

    const offline_at = toRoomOfflineAt({ current_user_id: user._id, data: top_members })

    return {
      id: room._id,
      type: room.type,
      name,
      avatar,
      message_unread_count: 0,
      is_online: !offline_at,
      offline_at,
      member_count: room.members?.length || 0,
      top_members,
      last_message: null,
    }
  }

  async updateRoomInfo(room_id: string, { room_avatar, room_name }: UpdateRoomInfoDto) {
    const room = await this.roomRepository.updateRoomInfo({
      room_avatar,
      room_name,
      room_id,
    })

    if (!room) {
      throw new HttpException('Failed to update room info', HttpStatus.BAD_REQUEST)
    }

    return room
  }

  async deleteAllMsgUnreadOfUserInRoom(room_id: string, user_id: string) {
    return await this.roomRepository.deleteAllMsgUnreadOfUserInRoom(room_id, user_id)
  }

  async deleteRoom(room_id: string, user: User) {
    const room = (await this.roomRepository.findById(room_id)) as Room
    if (!room?._id) {
      throw new HttpException('Failed to soft delete room', HttpStatus.BAD_REQUEST)
    }

    const users = await this.roomRepository.getSocketsFromRoom(room)

    // delete room record if does not contain messages
    if (room.messages?.length === 0) {
      await this.roomRepository.destroyRoom(room._id)
    } else {
      await this.roomRepository.deleteRoom(room)
    }

    if (room.members?.length) {
      await this.roomRepository.deleteRoomFromUsers(
        room._id,
        room.members?.map((item) => item.user_id)
      )
    }

    this.websocket.server.to(room._id).emit(WebsocketEmitEvents.DELETE_ROOM, { room_id: room._id })
    users.forEach((item) => {
      if (item?.socket_id && !compareTwoObjectId(item.user_id, user._id)) {
        this.websocket.server
          ?.to(item.socket_id)
          ?.emit(WebsocketEmitEvents.DELETE_ROOM, { room_id: room._id })
      }
    })

    return { room_id: room._id }
  }

  async getSocketsFromRoom(params: string | Room): Promise<UserSocketId[]> {
    return await this.roomRepository.getSocketsFromRoom(params)
  }

  async leaveRoom(room: Room, user_id: string) {
    this.checkRoomTypeIsGroup(room)

    if (!room.members?.some((item) => compareTwoObjectId(item.user_id, user_id))) {
      throw new HttpException('You are not belong to this room', HttpStatus.BAD_REQUEST)
    }

    await this.roomRepository.deleteMemberFromRoom(room._id, user_id)
    await this.roomRepository.deleteRoomFromUsers(room._id, [user_id])

    const response = { user_id: user_id, room_id: room?._id }
    const socketIds = await this.getSocketsFromRoom(room)
    socketIds.forEach((data) => {
      if (data?.socket_id) {
        this.websocket.server
          ?.to(data.socket_id)
          ?.emit(WebsocketEmitEvents.MEMBER_LEAVE_ROOM, response)
      }
    })

    return response
  }

  checkRoomTypeIsGroup(room: Room) {
    if (room.type !== 'group') {
      throw new HttpException('This room is not a group chat', HttpStatus.BAD_REQUEST)
    }
  }

  async joinRoom(room: Room, user_id: string) {
    this.checkRoomTypeIsGroup(room)

    if (room?.members?.some((item) => compareTwoObjectId(item.user_id, user_id))) {
      throw new HttpException('You are already in this room', HttpStatus.BAD_REQUEST)
    }

    await this.roomRepository.addMemberToRoom(room._id, user_id)
    await this.userRepository.saveRoomToUserIds([user_id], room._id)

    const response = { user_id: user_id, room_id: room?._id }
    const socketIds = await this.getSocketsFromRoom(room)
    socketIds.forEach((data) => {
      if (data?.socket_id) {
        this.websocket.server
          .to(data.socket_id)
          ?.emit(WebsocketEmitEvents.MEMBER_JOIN_ROOM, response)
      }
    })

    return response
  }

  async getMembersInRoom(
    params: QueryCommonParams & { room: Room }
  ): Promise<ListRes<RoomMemberRes[]>> {
    const { limit, offset, room } = params

    const filter = {
      _id: {
        $in: room?.members?.map((item) => item.user_id) || [],
      },
    }

    const members = (await this.userRepository.find(filter, {
      limit: limit,
      skip: offset,
      sort: { offline_at: -1 },
    })) as User[]

    const total = await this.userRepository.countDocuments(filter)

    return toListResponse({ limit, offset, total, data: toRoomMemberListResponse(members) })
  }

  async addMessageUnreadToRoom(message_id: string, user_id: string) {
    const messageRes = await this.messageRepository.findMessage(message_id, user_id)
    if (!messageRes?.id) {
      throw new HttpException('Không tìm thấy tin nhắn', HttpStatus.NOT_FOUND)
    }

    const room = await this.roomRepository.addMessageUnreadToRoom({
      message_id: messageRes.id,
      room_id: messageRes.room_id,
      user_id,
    })
    if (!room) {
      throw new HttpException('Failed to add message unread to room', HttpStatus.BAD_REQUEST)
    }

    return {
      message_unread_count: toMessageUnreadCount(room, user_id),
    }
  }
}
