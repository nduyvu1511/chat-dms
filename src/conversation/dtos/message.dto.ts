import { AttachmentTypeEnum } from '@attachment/types'
import { LngLatDto } from '@common/dtos'
import { OBJECT_ID_REGEX } from '@common/regex'
import { MessageEmotionEnum, MessageEmotionType } from '@conversation/types'
import { ApiProperty } from '@nestjs/swagger'
import { UserIdUserNameDto } from '@user/dtos'
import { Expose, Type } from 'class-transformer'
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator'

export class MessageIdDto {
  @ApiProperty()
  @Expose()
  @Matches(OBJECT_ID_REGEX)
  @IsNotEmpty()
  message_id: string
}

export class ReplyMessageDto {
  @Expose()
  @Matches(OBJECT_ID_REGEX)
  @IsNotEmpty()
  message_id: string

  @Expose()
  @Matches(OBJECT_ID_REGEX)
  @IsOptional()
  attachment_id?: string
}

export class SendMessageTest {}

export class SendMessageDto {
  @ApiProperty()
  @Expose()
  @Matches(OBJECT_ID_REGEX)
  @IsNotEmpty()
  room_id: string

  @ApiProperty()
  @Expose()
  @ArrayNotEmpty()
  @IsString({ each: true })
  attachment_ids?: string[]

  @ApiProperty({})
  @Expose()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsOptional()
  mention_to?: string[]

  @ApiProperty()
  @Expose()
  @IsOptional()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => LngLatDto)
  location?: LngLatDto

  @ApiProperty()
  @Expose()
  @IsObject()
  @IsNotEmptyObject()
  @ValidateNested()
  @IsOptional()
  @Type(() => ReplyMessageDto)
  reply_to?: ReplyMessageDto

  @ApiProperty()
  @Expose()
  @IsOptional()
  @IsString()
  text?: string

  @ApiProperty()
  @Expose()
  @IsOptional()
  @IsNumber()
  order_id?: number

  @ApiProperty()
  @Expose()
  @IsOptional()
  @IsNumber()
  product_id?: number
}

export class LikeMessageDto {
  @ApiProperty()
  @Expose()
  @Matches(OBJECT_ID_REGEX)
  @IsNotEmpty()
  message_id: string

  @ApiProperty({ enum: MessageEmotionEnum })
  @Expose()
  @IsNotEmpty()
  @IsEnum(MessageEmotionEnum)
  emotion: MessageEmotionType
}

export class AttachmentResDto {
  @ApiProperty()
  @IsNotEmpty()
  id: string

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(AttachmentTypeEnum)
  type: string

  @ApiProperty()
  @IsNotEmpty()
  thumbnail_url: string

  @ApiProperty()
  @IsNotEmpty()
  url: string
}

export class MessageReplyResDto {
  @ApiProperty()
  @IsNotEmpty()
  author_id: string

  @ApiProperty()
  @IsNotEmpty()
  author_name: string

  @ApiProperty()
  @IsNotEmpty()
  author_avatar: string | null

  @ApiProperty()
  @IsNotEmpty()
  author_socket_id: string | null

  @ApiProperty()
  @IsNotEmpty()
  id: string

  @ApiProperty()
  @IsNotEmpty()
  text: string

  @ApiProperty()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AttachmentResDto)
  attachment: AttachmentResDto | null

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  created_at: Date
}

export class MessageResDto {
  @ApiProperty()
  @IsNotEmpty()
  id: string

  @ApiProperty()
  @IsNotEmpty()
  room_id: string

  @ApiProperty()
  @IsNotEmpty()
  author_id: string

  @ApiProperty()
  @IsNotEmpty()
  author_name: string

  @ApiProperty()
  @IsNotEmpty()
  author_avatar: string | null

  @ApiProperty()
  @IsNotEmpty()
  author_socket_id: string | null

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  text: string

  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentResDto)
  attachments?: AttachmentResDto

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  offline_at: string | null

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  product_id: number

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  order_id: number

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  reaction_count: number

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(MessageEmotionEnum)
  your_reaction: string

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(MessageEmotionEnum, { each: true })
  reactions: []

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  is_author?: boolean

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  is_read?: boolean

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  is_hidden?: boolean

  @ApiProperty()
  @IsObject()
  @ValidateNested()
  @Type(() => LngLatDto)
  location?: LngLatDto | null

  @ApiProperty()
  @IsObject()
  @ValidateNested()
  @Type(() => MessageReplyResDto)
  reply_to: MessageReplyResDto

  @ApiProperty()
  // @IsArray()
  // @ValidateNested({ each: true })
  @Type(() => UserIdUserNameDto)
  mention_to: UserIdUserNameDto
}
