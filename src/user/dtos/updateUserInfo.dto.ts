import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsNotEmpty, IsString } from 'class-validator'

export class UpdateUserInfoDto {
  @ApiProperty()
  @Expose()
  @IsNotEmpty()
  @IsString()
  user_name: string

  @ApiProperty()
  @Expose()
  @IsNotEmpty()
  avatar: string
}
