import { SELECT_USER } from '@common/constant'
import { PaginationDto } from '@common/dtos'
import { BaseRepository } from '@common/repositories'
import { ListRes } from '@common/types'
import { toListResponse } from '@common/utils'
import { SendMessageDto } from '@conversation/dtos'
import { MessageDocument } from '@conversation/models'
import {
  GetMessagesByFilter,
  LikeMessageService,
  Message,
  MessagePopulate,
  MessageRes,
  UnlikeMessageService,
  UserLikedMessage,
} from '@conversation/types'
import { toMessageListResponse, toMessageResponse } from '@conversation/utils'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { UserRes } from '@user/types'
import * as _ from 'lodash'
import { ObjectId } from 'mongodb'
import { Model } from 'mongoose'

@Injectable()
export class MessageRepository extends BaseRepository<MessageDocument> {
  constructor(
    @InjectModel('Message')
    private readonly messageModel: Model<MessageDocument>
  ) {
    super(messageModel)
  }

  async readMessage(message_id: string, user_id: string) {
    return this.messageModel.findOneAndUpdate(
      {
        $and: [
          {
            _id: message_id,
          },
          { 'read_by.user_id': { $nin: user_id } },
        ],
      },
      {
        $addToSet: {
          read_by: { user_id },
        },
      }
    )
  }

  async readAllMessage(room_id: string, user_id: string) {
    const res = await this.messageModel.updateMany(
      {
        $and: [
          {
            room_id,
            'read_by.user_id': { $nin: user_id },
          },
        ],
      },
      {
        ['$addToSet' as any]: {
          read_by: { user_id },
        },
      }
    )

    return res.acknowledged
  }

  async likeMessage({ emotion, message_id, user_id }: LikeMessageService) {
    await this.unlikeMessage({ message_id, user_id })

    return this.messageModel.findByIdAndUpdate(message_id, {
      $addToSet: {
        liked_by: {
          user_id,
          emotion,
        },
      },
    })
  }

  async getUsersLikedMessage(message_id: string, { limit, offset }: PaginationDto) {
    const userList: UserLikedMessage[] = await this.messageModel.aggregate([
      {
        $match: {
          _id: new ObjectId(message_id),
        },
      },
      {
        $unwind: '$liked_by',
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ['$$ROOT', '$liked_by'],
          },
        },
      },
      {
        $project: {
          _id: 0,
          emotion: 1,
          user_id: 1,
        },
      },
      {
        $lookup: {
          from: 'Users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user_id',
          pipeline: [
            {
              $project: {
                _id: 0,
                user_id: '$_id',
                user_name: '$user_name',
                avatar: '$avatar',
                offline_at: '$offline_at',
              },
            },
            {
              $limit: limit,
            },
            {
              $skip: offset,
            },
          ],
        },
      },
      {
        $unwind: '$user_id',
      },
      {
        $group: {
          _id: '$emotion',
          data: {
            $push: '$user_id',
          },
        },
      },
      {
        $project: {
          _id: 1,
          data: 1,
        },
      },
    ])

    const newUserList = userList.map((item) => ({
      ...item,
      data: item.data.map((_item) => ({ ..._item, reaction: item._id })),
    }))

    const dataRes: { [key: string]: UserRes[] } = newUserList.reduce(
      (a, b) => ({
        ...a,
        [b._id as string]: b.data,
      }),
      {}
    )

    return {
      all: _.flattenDeep([...newUserList].map((item) => item.data)),
      ...dataRes,
    }
  }

  async unlikeMessage({ message_id, user_id }: UnlikeMessageService) {
    return this.messageModel.findByIdAndUpdate(message_id, {
      $pull: { liked_by: { user_id } },
    })
  }

  async findMessage(message_id: string, user_id: string): Promise<MessageRes | null> {
    const message: MessagePopulate | null = await this.messageModel
      .findById(message_id)
      .populate({
        path: 'user_id',
        model: 'User',
        select: SELECT_USER,
      })
      .populate({
        path: 'reply_to.message_id',
        populate: {
          path: 'user_id',
          model: 'User',
          select: SELECT_USER,
        },
      })
      .populate('reply_to.attachment_id')
      .populate('attachments')
      .populate('mention_to')
      .lean()

    if (!message?._id) return null

    return toMessageResponse(message, user_id)
  }

  async findMessagesByFilter(params: GetMessagesByFilter): Promise<ListRes<MessageRes[]>> {
    const { limit, offset, filter, user_id } = params

    const messages: MessagePopulate[] = await this.messageModel
      .find(filter)
      .populate({
        path: 'user_id',
        model: 'User',
        select: SELECT_USER,
      })
      .populate({
        path: 'reply_to.message_id',
        populate: {
          path: 'user_id',
          model: 'User',
          select: SELECT_USER,
        },
      })
      .populate('reply_to.attachment_id')
      .populate('mention_to')
      .populate('attachments')
      .limit(limit)
      .skip(offset)
      .sort({ created_at: -1 })
      .lean()

    const total = await this.messageModel.countDocuments(filter)

    return toListResponse({
      limit,
      offset,
      total,
      data: toMessageListResponse(messages, user_id),
    })
  }

  async sendMessage(message: SendMessageDto & { user_id: string }) {
    return this.messageModel.create({
      ...message,
      attachments: message?.attachment_ids || [],
      read_by: [{ user_id: message.user_id }],
    })
  }
}
