import { HttpResponse } from '@common/utils'
import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { UpdateUserInfoDto } from '@user/dtos'
import { CreateUserDto, LoginResDto, UserResDto } from '@user/dtos/user.dto'
import { AuthGuard, UserGuard } from '@user/guards'
import { UserService } from '@user/services'
import { toUserResponse } from '@user/utils'
import { plainToClass } from 'class-transformer'
import { Request } from 'express'

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  @ApiOkResponse({ type: LoginResDto })
  @ApiOkResponse({ type: UserResDto })
  async createUser(@Body() userDto: CreateUserDto) {
    const user = plainToClass(CreateUserDto, userDto, { excludeExtraneousValues: true })
    const data = await this.userService.create(user)
    return new HttpResponse(data, 'Tạo người dùng thành công')
  }

  @ApiOkResponse({ type: UserResDto })
  @Get()
  @UseGuards(AuthGuard, UserGuard)
  async getUserInfo(@Req() request: Request) {
    const data = toUserResponse({ ...request._user, current_user_id: request._user._id.toString() })
    return new HttpResponse(data)
  }

  @ApiOkResponse({ type: UserResDto })
  @Get('/:id')
  @UseGuards(AuthGuard, UserGuard)
  async getUserInfoById(@Req() request: Request) {
    const data = toUserResponse({ ...request._user, current_user_id: request._user._id.toString() })
    return new HttpResponse(data)
  }

  @Patch('/')
  @UseGuards(AuthGuard)
  @ApiOkResponse({ type: UserResDto })
  async updateUserInfo(@Req() request: Request, @Body() userUpdate: UpdateUserInfoDto) {
    const data = await this.userService.updateUserInfo({
      ...userUpdate,
      user_id: request._user._id.toString(),
      current_user_id: request._user._id.toString(),
    })

    return new HttpResponse(data, 'Cập nhật người dùng thành công')
  }

  @Patch('/:id')
  @UseGuards(AuthGuard)
  @ApiOkResponse({ type: UserResDto })
  async updateUserInfoWithId(@Param('id') user_id: string, @Body() userUpdate: UpdateUserInfoDto) {
    const data = await this.userService.updateUserInfo({
      ...plainToClass(UpdateUserInfoDto, userUpdate),
      user_id,
    })
    return new HttpResponse(data, 'Cập nhật người dùng thành công')
  }
}
