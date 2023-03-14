import { BaseRepository } from '@common/repositories'
import { toListResponse } from '@common/utils'
import { GetRoomsQueryDto } from '@conversation/dtos'
import { RoomDocument } from '@conversation/models'
import {
  AddMessageUnreadService,
  CreateGroupChat,
  CreateSingleChatService,
  MessageUnreadCountQueryRes,
  MessageUnreadCountRes,
  Room,
  RoomInfoRes,
  RoomPopulate,
  UpdateRoomInfoService,
} from '@conversation/types'
import { toRoomListResponse } from '@conversation/utils'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { UserDocument } from '@user/models'
import { User, UserSocketId } from '@user/types'
import { ObjectId } from 'mongodb'
import { FilterQuery, Model, PipelineStage, UpdateQuery } from 'mongoose'

@Injectable()
export class RoomRepository extends BaseRepository<RoomDocument> {
  constructor(
    @InjectModel('Room')
    private readonly roomModel: Model<RoomDocument>,
    @InjectModel('User')
    private readonly userModel: Model<UserDocument>
  ) {
    super(roomModel)
  }

  async createSingleChatRoom(params: CreateSingleChatService): Promise<Room> {
    return this.roomModel.create({
      type: params?.type === 'admin' ? 'admin' : 'single',
      name: null,
      members: [{ user_id: params.user._id }, { user_id: params.partner._id }],
    } as RoomDocument)
  }

  async createGroupChatRoom(params: CreateGroupChat): Promise<Room> {
    return this.roomModel.create({
      name: params?.room_name || null,
      avatar: params?.room_avatar || null,
      type: 'group',
      members: params.member_ids?.map((user_id) => ({ user_id })),
    } as RoomDocument)
  }

  async findRooms({ keyword, limit, offset, user }: GetRoomsQueryDto & { user: User }) {
    const filter: FilterQuery<Room> = {
      $and: [
        {
          _id: { $in: user?.room_joineds || [] },
        },
        {
          is_deleted: false,
        },
      ],
    }

    const query: PipelineStage[] = [
      {
        $match: filter,
      },
      // Get members in room
      {
        $lookup: {
          from: 'Users',
          localField: 'members.user_id',
          foreignField: '_id',
          as: 'top_members',
          pipeline: [
            { $sort: { offline_at: -1 } },
            { $limit: 4 },
            {
              $project: {
                _id: 0,
                user_id: '$_id',
                user_name: '$user_name',
                avatar: { $ifNull: ['$avatar', null] },
                offline_at: '$offline_at',
                phone: '$phone',
              },
            },
          ],
        },
      },
      {
        $match: keyword
          ? {
              $or: [
                {
                  name: { $regex: keyword, $options: 'i' },
                },
                // {
                //   phone: { $regex: keyword, $options: 'i' },
                // },
                {
                  'top_members.user_name': {
                    $regex: keyword,
                    $options: 'i',
                  },
                },
              ],
            }
          : {},
      },
      // Get last message in room
      {
        $lookup: {
          from: 'Messages',
          localField: 'last_message',
          foreignField: '_id',
          as: 'last_message',
          pipeline: [
            {
              $lookup: {
                from: 'Users',
                localField: 'user_id',
                foreignField: '_id',
                as: 'user_id',
                pipeline: [
                  {
                    $project: {
                      user_name: 1,
                    },
                  },
                ],
              },
            },
            {
              $project: {
                _id: 0,
                id: '$_id',
                text: 1,
                location: 1,
                user_name: '$user_id.user_name',
                user_id: '$user_id._id',
                attachments: 1,
                created_at: 1,
                user_avatar: '$user_id.avatar',
                order_id: 1,
                product_id: 1,
              },
            },
            {
              $unwind: {
                path: '$user_name',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $unwind: {
                path: '$user_id',
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$last_message',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          id: '$_id',
          name: '$name',
          avatar: '$avatar',
          type: '$type',
          last_message: { $ifNull: ['$last_message', null] },
          member_count: { $size: '$members' },
          message_unread_count: {
            $filter: {
              input: '$members',
              as: 'item',
              cond: { $eq: ['$$item.user_id', new ObjectId(user._id)] },
            },
          },
          top_members: '$top_members',
        },
      },
      {
        $set: {
          message_unread_count: {
            $arrayElemAt: ['$message_unread_count.message_unreads', 0],
          },
        },
      },
      {
        $sort: { 'last_message.created_at': -1 },
      },
    ]

    const data: RoomPopulate[] = await this.roomModel.aggregate([
      ...query,
      { $skip: offset },
      { $limit: limit },
    ])
    const total = keyword ? data.length : await this.roomModel.countDocuments(filter)

    console.log(
      'test room res: ',
      toListResponse({
        limit,
        offset,
        total,
        data: toRoomListResponse(data, user._id),
      })
    )

    return toListResponse({
      limit,
      offset,
      total,
      data: toRoomListResponse(data, user._id),
    })
  }

  async getRoomById(_id: string): Promise<Room> {
    return this.roomModel.findOne({ $and: [{ _id }, { is_deleted: false }] }).lean()
  }

  async getMsgUnreadCount(user_id: string, room_ids: string[]): Promise<MessageUnreadCountRes> {
    const data: MessageUnreadCountQueryRes[] = await this.roomModel.aggregate([
      {
        $match: { $expr: { $in: ['$_id', room_ids] } },
      },
      {
        $project: {
          room_id: '$_id',
          user_ids: {
            $filter: {
              input: '$members',
              as: 'members',
              cond: {
                $eq: ['$$members.user_id', { $toObjectId: user_id }],
              },
            },
          },
        },
      },
      { $unwind: '$user_ids' },
      {
        $replaceRoot: { newRoot: { $mergeObjects: ['$$ROOT', '$user_ids'] } },
      },
      {
        $project: { _id: '$room_id', message_unreads: 1 },
      },
      {
        $match: { message_unreads: { $gt: [{ $size: '$message_unreads' }, 0] } },
      },
    ])

    return {
      room_ids: (data || [])?.map((item) => item._id),
      message_unread_count: data?.length || 0,
    }
  }

  async addMessageToRoom(room_id: string, message_id: string) {
    return this.roomModel.findByIdAndUpdate(room_id, {
      $addToSet: {
        messages: message_id,
      },
      last_message: message_id,
    })
  }

  async addMessageUnreadToRoom({
    room_id,
    message_id,
    user_id,
  }: AddMessageUnreadService): Promise<Room> {
    return this.roomModel.findOneAndUpdate(
      { _id: room_id },
      {
        $addToSet: {
          'members.$[e1].message_unreads': message_id,
        },
      },
      {
        arrayFilters: [{ 'e1.user_id': user_id }],
        new: true,
      }
    )
  }

  async deleteAllMsgUnreadOfUserInRoom(room_id: string, user_id: string): Promise<Room | null> {
    return await this.roomModel.findByIdAndUpdate(
      room_id,
      {
        'members.$[e1].message_unreads': [],
      },
      {
        arrayFilters: [{ 'e1.user_id': user_id }],
      }
    )
  }

  async deleteRoom(params: Room): Promise<Room | null> {
    const room: Room | null = await this.roomModel
      .findOneAndUpdate(
        { $and: [{ _id: params._id }, { is_deleted: false }] },
        {
          $set: {
            is_deleted: true,
            deleted_at: Date.now(),
            members_leaved: params.members.map((item) => ({ user_id: item.user_id })),
          },
        }
      )
      .lean()

    return room
  }

  async destroyRoom(room_id: string): Promise<boolean> {
    return this.roomModel.findByIdAndDelete(room_id)
  }

  async addMemberToRoom(room_id: string, user_id: string): Promise<Room | null> {
    const res = await this.findOneAndUpdate(
      { $and: [{ _id: room_id }, { is_deleted: false }] },
      {
        $addToSet: {
          members: { user_id },
        },
        $pull: {
          members_leaved: { user_id },
        },
        $set: {
          updated_at: Date.now(),
        },
      }
    )

    return res as Room
  }

  async deleteMemberFromRoom(room_id: string, user_id: string): Promise<Room | null> {
    const room = await this.roomModel.findOneAndUpdate(
      {
        $and: [{ _id: room_id }, { is_deleted: false }],
      },
      {
        $pull: {
          members: { user_id },
        },
        $addToSet: {
          members_leaved: { user_id },
        },
        $set: {
          updated_at: Date.now(),
        },
      }
    )

    return room
  }

  async getSocketsByUsers(user_ids: string[]): Promise<UserSocketId[]> {
    const users: User[] = await this.userModel
      .find({ _id: { $in: user_ids } })
      .select(['socket_id', 'room_joineds', 'device_id', 'role'])
      .lean()

    if (!users?.length) return []

    return users.map((item) => ({
      socket_id: item.socket_id,
      user_id: item._id,
      device_id: item.device_id,
      room_joineds: item?.room_joineds || [],
      role: item.role,
    }))
  }

  async getSocketsFromRoom(params: string | Room): Promise<UserSocketId[]> {
    const room = (params as Room)?._id ? (params as Room) : await this.getRoomById(params as string)
    if (!room?.members?.length) return []

    return await this.getSocketsByUsers(room.members.map((item) => item.user_id.toString()))
  }

  async deleteRoomFromUsers(room_id: string, user_ids: string[]): Promise<boolean> {
    const res = await this.userModel.updateMany(
      {
        _id: {
          $in: user_ids,
        },
      },
      {
        $pull: {
          room_joineds: new ObjectId(room_id),
        },
      }
    )

    return res.acknowledged
  }

  async updateRoomInfo(params: UpdateRoomInfoService): Promise<RoomInfoRes | null> {
    const { room_name, room_id, room_avatar } = params
    const updateQuery: UpdateQuery<Room> = {}
    if (room_name) {
      updateQuery.name = room_name
    }
    if (room_avatar) {
      updateQuery.avatar = room_avatar
    }

    const room: Room = await this.roomModel
      .findOneAndUpdate(
        { $and: [{ _id: room_id }, { is_deleted: false }] },
        {
          $set: updateQuery,
        },
        { new: true }
      )
      .lean()

    if (!room) return null

    return {
      member_count: room.members.length || 0,
      room_id: room._id,
      room_name: room.name,
      room_type: room.type,
      room_avatar: room?.avatar || null,
    }
  }
}
