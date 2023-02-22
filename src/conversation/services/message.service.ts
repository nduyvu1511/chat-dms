import { AttachmentRepository } from '@attachment/repositories'
import { WebsocketEmitEvents } from '@common/constant'
import { PaginationDto } from '@common/dtos'
import { compareTwoObjectId } from '@common/helpers'
import { OBJECT_ID_REGEX } from '@common/regex'
import { SendMessageDto } from '@conversation/dtos'
import { MessageRepository, RoomRepository } from '@conversation/repositories'
import {
  GetMessagesByFilter,
  LikeMessageService,
  Message,
  MessageRes,
  UnlikeMessageService,
} from '@conversation/types'
import { UserGateway } from '@gateway/user.gateway'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { UserRepository } from '@user/repositories'
import { User } from '@user/types'

@Injectable()
export class MessageService {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly userRepository: UserRepository,
    private readonly roomRepository: RoomRepository,
    private readonly attachmentRepository: AttachmentRepository,
    private readonly websocket: UserGateway
  ) {}

  async getMessageRes(message_id: string, user_id: string): Promise<MessageRes | null> {
    return await this.messageRepository.findMessage(message_id, user_id)
  }

  async getMessage(message_id: string): Promise<Message> {
    const message = await this.messageRepository.findById(message_id)
    if (!message?._id) {
      throw new HttpException('Message not found', HttpStatus.BAD_REQUEST)
    }

    return message as Message
  }

  async getMessagesByFilter(params: GetMessagesByFilter) {
    return await this.messageRepository.findMessagesByFilter(params)
  }

  async confirmReadMessage(
    message_id: string,
    user_id: string
  ): Promise<{ message_id: string } | null> {
    const message = await this.messageRepository.readMessage(message_id, user_id)
    if (!message?._id) {
      throw new HttpException('Failed to read message', HttpStatus.BAD_REQUEST)
    }

    return { message_id: message._id }
  }

  async confirmReadAllMessage(
    room_id: string,
    user_id: string
  ): Promise<{ room_id: string } | null> {
    const res = await this.messageRepository.readAllMessage(room_id, user_id)
    if (!res) {
      throw new HttpException('Failed to read all message', HttpStatus.BAD_REQUEST)
    }

    return { room_id }
  }

  async likeMessage(params: LikeMessageService) {
    const msg = await this.messageRepository.likeMessage(params)
    if (!msg?._id) {
      throw new HttpException('Failed to like message', HttpStatus.BAD_REQUEST)
    }

    const message = await this.getMessageRes(params.message_id, params.user_id)
    if (message?.id) {
      this.websocket.server.to(message.room_id).emit(WebsocketEmitEvents.LIKE_MESSAGE, message)
    }

    return message
  }

  async unlikeMessage(params: UnlikeMessageService) {
    const msg = await this.messageRepository.unlikeMessage(params)
    if (!msg?._id) {
      throw new HttpException('Failed to unlike message', HttpStatus.BAD_REQUEST)
    }

    const message = await this.getMessageRes(params.message_id, params.user_id)
    if (message?.id) {
      this.websocket.server.to(message.room_id).emit(WebsocketEmitEvents.UNLIKE_MESSAGE, message)
    }

    return message
  }

  async getUsersLikedMessage(message_id: string, params: PaginationDto) {
    return await this.messageRepository.getUsersLikedMessage(message_id, params)
  }

  async getUsersReadMessage(message_id: string, user_id: string, { limit, offset }: PaginationDto) {
    const message = await this.getMessage(message_id)

    return await this.userRepository.getUsersByFilter({
      filter: {
        $and: [
          {
            _id: { $in: message.read_by.map((item) => item.user_id) },
          },
          { _id: { $ne: user_id } },
        ],
      },
      limit,
      offset,
    })
  }

  async sendMessage(params: SendMessageDto, user: User): Promise<MessageRes | null> {
    if (
      !params.text &&
      !params.location &&
      !params?.attachment_ids?.length &&
      !params?.order_id &&
      !params?.product_id
    ) {
      throw new HttpException('Missing field to send message', HttpStatus.BAD_REQUEST)
    }

    const room = await this.roomRepository.getRoomById(params.room_id)
    if (!room?._id) {
      throw new HttpException(
        'Failed to send message because this room has been deleted',
        HttpStatus.BAD_REQUEST
      )
    }

    let attachment_ids: string[] = []
    if (params?.attachment_ids?.length) {
      const attachmentsRes = await this.attachmentRepository.getAttachments(params.attachment_ids)
      attachment_ids = attachmentsRes?.map((item) => item._id)
    }

    let mention_to: string[] = []
    if (params?.mention_to?.length) {
      const userIds = [...params.mention_to].filter((item) => OBJECT_ID_REGEX.test(item))
      if (userIds?.length) {
        const users = await this.userRepository.find({
          _id: { $in: userIds },
        })
        mention_to = users?.map((item) => item._id)
      }

      if (mention_to?.length && room.type !== 'group') {
        throw new HttpException(
          "can't mention someone else in the room that's not the group",
          HttpStatus.BAD_REQUEST
        )
      }
    }

    if (params.reply_to?.message_id) {
      const message = await this.messageRepository.findById(params.reply_to.message_id)
      if (!message || !compareTwoObjectId(message.room_id, params.room_id)) {
        throw new HttpException(
          'Reply message not found, Reply message ID is invalid',
          HttpStatus.BAD_REQUEST
        )
      }
    }

    if (params.reply_to?.attachment_id) {
      const attachment = await this.attachmentRepository.findById(params.reply_to.attachment_id)
      if (!attachment)
        throw new HttpException('Reply message with attachment not found', HttpStatus.BAD_REQUEST)
    }

    const msg = await this.messageRepository.sendMessage({
      ...params,
      attachment_ids,
      user_id: user._id,
      mention_to,
    })
    if (!msg) {
      throw new HttpException('Failed to send message', HttpStatus.BAD_REQUEST)
    }

    await this.roomRepository.addMessageToRoom(room._id, msg._id)

    return await this.messageRepository.findMessage(msg._id, user._id)
  }
}
