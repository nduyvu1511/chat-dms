import { compareSyncPassword, hashPassword } from '@common/helpers'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ChangePasswordDto, CreatePasswordDto, CreateUserDto, GenerateTokenDto, LoginDto } from '@user/dtos'
import { UserRepository } from '@user/repositories'
import { TokenRes, User } from '@user/types'
import { toUserResponse } from '@user/utils/user.response'
import { UserService } from './user.service'

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly userRepository: UserRepository
  ) { }

  async register(userDto: CreateUserDto) {
    try {
      const user = (await this.userService.create(userDto)) as User
      const access_token = await this.generateToken(user)
      const refresh_token = await this.generateRefreshToken(user)

      return {
        ...toUserResponse(user),
        access_token,
        refresh_token,
      }
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST)
    }
  }

  async generateTokenFromId(params: GenerateTokenDto) {
    try {
      const tokenData: any = this.jwtService.verify(params.token, { secret: process.env.USER_ID_SECRET_KEY })
      if (!tokenData?.user_id) {
        throw new HttpException('Can not decode data from token', HttpStatus.BAD_REQUEST)
      }
      const user = await this.userRepository.findOne({ user_id: +tokenData?.user_id }) as User
      if (!user) {
        throw new HttpException('User not found, can not generate token', HttpStatus.BAD_REQUEST)
      }

      const access_token = await this.generateToken(user)
      const refresh_token = await this.generateRefreshToken(user)

      return {
        ...toUserResponse(user),
        access_token,
        refresh_token,
      }


    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST)
    }
  }


  async login(loginUserDto: LoginDto) {
    try {
      const user = (await this.userService.findByLogin(loginUserDto)) as User
      const access_token = await this.generateToken(user)
      const refresh_token = await this.generateRefreshToken(user)

      return {
        ...toUserResponse(user),
        access_token,
        refresh_token,
      }
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST)
    }
  }

  async validateUser(loginUserDto: LoginDto) {
    const user = await this.userRepository.findOne({ phone: loginUserDto.phone })
    if (!user) {
      throw new HttpException('Không tìm thấy người dùng', HttpStatus.UNAUTHORIZED)
    }
    return user
  }

  async generateToken(user: User): Promise<TokenRes> {
    const expires_in = Number(process.env.ACCESS_TOKEN_EXPIRES_IN)

    const token = this.jwtService.sign(
      {
        _id: user._id,
        user_id: user.user_id,
        role: user.role,
      },
      { expiresIn: expires_in }
    )

    return {
      token,
      expires_in,
    }
  }

  async generateRefreshToken(user: User): Promise<TokenRes> {
    const expires_in = Number(process.env.REFRESH_TOKEN_EXPIRES_IN)

    const token = this.jwtService.sign(
      {
        _id: user._id,
        user_id: user.user_id,
        role: user.role,
      },
      { expiresIn: expires_in }
    )

    return {
      token,
      expires_in,
    }
  }

  async createPassword(data: CreatePasswordDto & { user: User }): Promise<boolean> {
    if (data.password !== data.confirm_password) {
      throw new HttpException('2 Mật khẩu phải giống nhau', HttpStatus.BAD_REQUEST)
    }

    if (data.user?.password) {
      throw new HttpException(
        'Người dùng đã có mật khẩu, vui lòng đổi mật khẩu',
        HttpStatus.BAD_REQUEST
      )
    }

    const password = await hashPassword(data.password)
    await this.userRepository.findOneAndUpdate(
      { _id: data.user._id },
      {
        $set: { password },
      }
    )

    return true
  }

  async changePassword(data: ChangePasswordDto & { user: User }): Promise<boolean> {
    if (data.new_password === data.password) {
      throw new HttpException('Mật khẩu mới và mật khẩu cũ phải khác nhau', HttpStatus.BAD_REQUEST)
    }

    if (data.new_password !== data.confirm_password) {
      throw new HttpException('2 mật khẩu xác nhận phải giống nhau', HttpStatus.BAD_REQUEST)
    }

    if (!data.user?.password) {
      throw new HttpException(
        'Người dùng chưa có mật khẩu, vui lòng tạo mới mật khẩu',
        HttpStatus.BAD_REQUEST
      )
    }

    const isCorrectPassword = compareSyncPassword(data.password, data.user.password)
    if (!isCorrectPassword) {
      throw new HttpException('Mật khẩu sai, vui lòng nhập mật khẩu khác', HttpStatus.BAD_REQUEST)
    }

    const password = await hashPassword(data.confirm_password)
    await this.userRepository.findOneAndUpdate(
      { _id: data.user._id },
      {
        $set: { password },
      }
    )

    return true
  }
}
