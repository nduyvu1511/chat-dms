import { compareSyncPassword, hashPassword } from '@common/helpers'
import { RoomRepository } from '@conversation/repositories'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { LoginDto, UpdateUserInfoDto } from '@user/dtos'
import { CreateUserDto } from '@user/dtos/user.dto'
import { UserDocument } from '@user/models'
import { UserRepository } from '@user/repositories'
import { User, UserRes } from '@user/types'
import { toUserResponse } from '@user/utils/user.response'

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly roomRepository: RoomRepository
  ) {}

  async create(userDto: CreateUserDto) {
    if (userDto?.password) {
      userDto.password = await hashPassword(userDto.password)
    }
    return await this.userRepository.create(userDto)
  }

  async removeSocket(socket_id: string) {
    return await this.userRepository.removeSocket(socket_id)
  }

  async getUserInfo(id: string): Promise<UserRes> {
    const userDoc = (await this.userRepository.findById(id)) as User
    return toUserResponse(userDoc)
  }

  async findById(id: string) {
    return this.userRepository.findById(id)
  }

  async addSocketToUser(user_id: string, socket_id: string) {
    return this.userRepository.addSocketToUser(user_id, socket_id)
  }

  async createChatWithAdmin(user: UserDocument): Promise<boolean> {
    try {
      // if (user.role !== 'th') return false

      const admins = await this.userRepository.findAdmin()

      if (admins?.length) {
        // await Promise.all(
        //   admins.map(async (partner) => {
        //     await RoomService.createSingleChat({ partner, user, room_type: 'admin' })
        //     return true
        //   })
        // )
      }

      return true
    } catch (error) {
      return false
    }
  }

  async getSocketsByUsers(user_ids: string[]) {
    return await this.userRepository.getSocketsByUsers(user_ids)
  }

  async getUserInfoByUser(params: User): Promise<UserRes> {
    const count = await this.roomRepository.getMsgUnreadCount(params._id, params.room_joineds)
    return { ...toUserResponse(params), message_unread_count: count.message_unread_count }
  }

  async findUserById(id: string) {
    return await this.userRepository.findById(id)
  }

  async findByLogin({ phone, device_id, password }: LoginDto) {
    const user = await this.userRepository.getUserByPhone(phone)
    if (!user) {
      throw new HttpException('User not found', HttpStatus.UNAUTHORIZED)
    }

    const is_equal = await compareSyncPassword(password, user.password)

    if (!is_equal) {
      throw new HttpException('Sai mật khẩu', HttpStatus.UNAUTHORIZED)
    }

    if (device_id) {
      await this.userRepository.setDeviceId(user._id, device_id)
    }

    return user
  }

  async updateUserInfo(
    params: UpdateUserInfoDto & { user_id: string; current_user_id?: string }
  ): Promise<UserRes> {
    const { user_id, ...data } = params
    const user = (await this.userRepository.findOneAndUpdate({ _id: params.user_id }, data)) as User

    return toUserResponse({ ...user, current_user_id: params?.current_user_id })
  }
}
