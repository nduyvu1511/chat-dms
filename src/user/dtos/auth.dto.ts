import { PHONE_REGEX } from '@common/regex'
import { ApiProperty } from '@nestjs/swagger'
import { UserRole } from '@user/types'
import { Expose } from 'class-transformer'
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, Matches, MinLength } from 'class-validator'

export class LoginDto {
  @ApiProperty()
  @Expose()
  @IsNotEmpty()
  @Matches(PHONE_REGEX)
  phone: string

  @ApiProperty()
  @Expose()
  @IsNotEmpty()
  @MinLength(8)
  password: string

  @ApiProperty()
  @IsOptional()
  @Expose()
  device_id?: string
}

export class RefreshTokenDto {
  @ApiProperty()
  @Expose()
  @IsNotEmpty()
  refresh_token: string
}

export class LoginSocketDto {
  @ApiProperty()
  @Expose()
  @IsNotEmpty()
  socket_id: string
}

export class RegisterDto {
  @ApiProperty()
  @Expose()
  @IsNotEmpty()
  @IsNumber()
  user_id: string

  @ApiProperty()
  @Expose()
  @IsNotEmpty()
  @Matches(PHONE_REGEX)
  phone: string

  @ApiProperty()
  @Expose()
  @IsNotEmpty()
  @MinLength(8)
  password: string

  @ApiProperty()
  @Expose()
  @IsNotEmpty()
  @IsEnum(UserRole)
  role: string
}

export class ChangePasswordDto {
  @ApiProperty()
  @Expose()
  @IsNotEmpty()
  @MinLength(8)
  password: string

  @ApiProperty()
  @Expose()
  @IsNotEmpty()
  @MinLength(8)
  new_password: string

  @ApiProperty()
  @Expose()
  @IsNotEmpty()
  @MinLength(8)
  confirm_password: string
}

export class CreatePasswordDto {
  @ApiProperty()
  @Expose()
  @IsNotEmpty()
  @MinLength(8)
  password: string

  @ApiProperty()
  @Expose()
  @IsNotEmpty()
  @MinLength(8)
  confirm_password: string
}
