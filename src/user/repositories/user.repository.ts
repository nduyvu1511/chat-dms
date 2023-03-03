import { SELECT_USER } from '@common/constant'
import { BaseRepository } from '@common/repositories'
import { ListRes } from '@common/types'
import { toListResponse } from '@common/utils'
import { TopMember } from '@conversation/types'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { TokenDocument, UserDocument } from '@user/models'
import { GetUserByFilter, MentionUserRes, User, UserRes, UserSocketId } from '@user/types'
import { toTopMemberListResponse, toUserListResponse } from '@user/utils'
import { Model } from 'mongoose'

@Injectable()
export class UserRepository extends BaseRepository<UserDocument> {
  constructor(
    @InjectModel('User')
    private readonly userModel: Model<UserDocument>,
    @InjectModel('Token')
    private readonly tokenModel: Model<TokenDocument>
  ) {
    super(userModel)
  }

  // async saveToken(params: SaveToken): Promise<TokenDocument> {
  //   const expires_at = moment()
  //     .add(params.expires_in / 1000, 'seconds')
  //     .toDate()

  //   const token = await this.tokenModel.create({ ...params, expires_at })
  //   await this.userModel.findByIdAndUpdate(params.user_id, {
  //     $set: {
  //       access_token: token._id,
  //     },
  //   })

  //   return token
  // }

  // async destroyToken(id: string): Promise<boolean> {
  //   return this.tokenModel.findByIdAndDelete(id)
  // }

  async getUsersByUserIds(user_ids: number[]): Promise<User[]> {
    return await this.userModel.find({ user_id: { $in: user_ids } }).lean()
  }

  async getTopMembers(ids: string[]): Promise<TopMember[]> {
    const members: User[] = await this.userModel
      .find({ _id: { $in: ids } })
      .sort({ offline_at: -1 })
      .lean()

    return toTopMemberListResponse(members)
  }

  async removeSocket(socket_id: string) {
    return this.userModel.findOneAndUpdate(
      { socket_id },
      {
        $set: {
          socket_id: null,
          is_online: false,
          offline_at: Date.now(),
        },
      }
    )
  }

  async saveRoomToUserIds(user_ids: string[], room_id: string) {
    await Promise.all(
      user_ids.map(async (user_id) => {
        const user = await this.userModel.findOneAndUpdate(
          { _id: user_id },
          {
            $addToSet: {
              room_joineds: room_id,
            },
          }
        )
        return user
      })
    )

    return true
  }

  async getUsersByFilter(params: GetUserByFilter): Promise<ListRes<UserRes[]>> {
    const { limit, offset, filter } = params
    const total = await this.userModel.countDocuments(filter)
    const res: User[] = await this.userModel
      .find(filter)
      .select(SELECT_USER)
      .limit(limit)
      .skip(offset)
      .lean()

    return toListResponse({
      data: toUserListResponse(res),
      limit,
      offset,
      total,
    })
  }

  async addSocketToUser(user_id: string, socket_id: string) {
    return this.userModel
      .findByIdAndUpdate(user_id, { $set: { socket_id, offline_at: null } }, { new: true })
      .lean()
  }

  async setFriends(user_ids: string[], type: 'add' | 'delete') {
    await Promise.all(
      user_ids.map(async (user_id) => {
        const partner_ids = user_ids.filter((id) => id !== user_id)

        return await this.userModel.findOneAndUpdate(
          { _id: user_id },
          {
            [type === 'add' ? '$addToSet' : '$pull']: {
              friends: { $each: partner_ids },
            },
          }
        )
      })
    )
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

  async getUserByUserId(user_id: number): Promise<User> {
    return this.userModel.findOne({ user_id })
  }

  async getUserByPhone(phone): Promise<User> {
    return this.userModel.findOne({ phone })
  }

  async setDeviceId(_id: string, device_id: string): Promise<boolean> {
    return this.userModel.findOneAndUpdate({ _id }, { $set: { device_id } })
  }

  async logout(_id: string): Promise<boolean> {
    return this.userModel.findOneAndUpdate({ _id }, { $set: { device_id: null, socket_id: null } })
  }

  async findAdmin(): Promise<UserDocument[]> {
    return this.userModel.find({ role: 'admin' })
  }
}
