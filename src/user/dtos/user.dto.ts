import { PHONE_REGEX } from '@common/regex'
import { ApiProperty } from '@nestjs/swagger'
import { UserRole } from '@user/types'
import { Expose } from 'class-transformer'
import { IsEnum, IsNotEmpty, IsNumber, IsString, Matches } from 'class-validator'

export class GenerateTokenDto {
  @ApiProperty({ description: 'Lấy ID từ partner_id của Odoo server, sau đó dùng jwt để encode' })
  @Expose()
  @IsNotEmpty()
  @IsString()
  token: string
}

export class CreateUserDto {
  @ApiProperty({ description: 'Là ID từ server Odoo' })
  @Expose()
  @IsNotEmpty()
  @IsNumber()
  user_id: number

  @ApiProperty()
  @Expose()
  password: string

  @ApiProperty()
  @Expose()
  @IsNotEmpty()
  user_name: string

  @ApiProperty({ enum: UserRole })
  @Expose()
  @IsNotEmpty()
  @IsEnum(UserRole)
  role: string

  @ApiProperty({ description: 'REGEX: /((^(+84|84|0|0084){1})(3|5|7|8|9))+([0-9]{8})$/' })
  @Expose()
  @IsNotEmpty()
  @Matches(PHONE_REGEX)
  phone: string

  @ApiProperty({ description: 'Lấy từ server Odoo, phải bao gồm domain' })
  @Expose()
  @IsNotEmpty()
  avatar: string
}

export class TokenDto {
  @ApiProperty()
  token: string

  @ApiProperty({
    description: 'Định dạng ms',
  })
  expires_in: number
}

export class UserResDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  avatar: string

  @ApiProperty()
  user_name: string

  @ApiProperty()
  socket_id: string

  @ApiProperty()
  offline_at: Date

  @ApiProperty()
  is_yourself: boolean

  @ApiProperty()
  @IsNumber()
  message_unread_count: number

  @ApiProperty({ enum: UserRole })
  @IsNotEmpty()
  @IsEnum(UserRole)
  role: string

  @IsNotEmpty()
  @Matches(PHONE_REGEX)
  phone: string
}

export class LoginResDto extends UserResDto {
  @ApiProperty()
  access_token: TokenDto
  @ApiProperty()
  refresh_token: TokenDto
}

export class HasPasswordResDto {
  @ApiProperty()
  has_password: boolean
}

export class UserIdUserNameDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  user_id: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  user_name: string
}
