import { PaginationDto } from '@common/dtos'
import { OBJECT_ID_REGEX } from '@common/regex'
import { RoomTypeEnum } from '@conversation/types'
import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  Matches,
  ValidateNested,
} from 'class-validator'

export class CreateSingleChatDto {
  @ApiProperty()
  @Expose()
  @IsNotEmpty()
  @IsNumber()
  partner_id: number
}

export class CreateGroupChatDto {
  @ApiProperty()
  @Expose()
  @IsNotEmpty()
  room_name: string

  @ApiProperty()
  @Expose()
  @IsOptional()
  room_avatar?: string

  @ApiProperty()
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  @Expose()
  @IsNotEmpty()
  member_ids: number[]
}

export class GetRoomsQueryDto extends PaginationDto {
  @ApiProperty()
  @Expose()
  @IsOptional()
  @Type(() => String)
  keyword?: string
}

export class RoomIdAndPaginationDto extends PaginationDto {
  @ApiProperty()
  @Expose()
  @Matches(OBJECT_ID_REGEX)
  @IsNotEmpty()
  room_id: string
}

export class RoomIdDto {
  @ApiProperty()
  @Expose()
  @Matches(OBJECT_ID_REGEX)
  @IsNotEmpty()
  room_id: string
}

export class UpdateRoomInfoDto {
  @ApiProperty()
  @Expose()
  @IsOptional()
  room_name?: string

  @ApiProperty()
  @Expose()
  @IsOptional()
  room_avatar?: string
}

export class TopMemberResDto {
  @ApiProperty()
  @IsNotEmpty()
  user_id: string

  @ApiProperty()
  @IsNotEmpty()
  user_name: string

  @ApiProperty()
  @IsNotEmpty()
  user_avatar: string

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  offline_at: string | null
}

export class LastMessageDto {
  @ApiProperty()
  @IsNotEmpty()
  id: string

  @ApiProperty()
  @IsNotEmpty()
  text: string | null

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  created_at: string

  @ApiProperty()
  @IsNotEmpty()
  user_id: number

  @ApiProperty()
  @IsNotEmpty()
  user_name: string | null

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  is_author: boolean
}

export class RoomResDto {
  @ApiProperty()
  @IsNotEmpty()
  id: string

  @ApiProperty()
  @IsNotEmpty()
  name: string | null

  @ApiProperty()
  @IsNotEmpty()
  avatar?: string | null

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(RoomTypeEnum)
  type: string

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  member_count: number

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  message_unread_count: number

  @ApiProperty()
  @Expose()
  @IsObject()
  @ValidateNested()
  @Type(() => LastMessageDto)
  last_message?: LastMessageDto

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  is_online?: boolean

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  offline_at: string | null

  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TopMemberResDto)
  top_members?: TopMemberResDto
}
