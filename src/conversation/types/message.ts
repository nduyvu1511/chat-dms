import { Attachment, AttachmentRes } from '@attachment/types'
import { Lnglat, QueryCommonParams } from '@common/types'
import { User, UserRes } from '@user/types'
import { ObjectId } from 'mongodb'
import { FilterQuery } from 'mongoose'

export interface Message {
  _id: string
  user_id: ObjectId
  room_id: ObjectId
  text: string
  product_id: number
  order_id: number
  location: Lnglat
  attachments: string[]
  mention_to: string[]
  reply_to: {
    message_id: ObjectId
    attachment_id?: ObjectId
  }
  read_by: ReadByUserId[]
  is_hidden: boolean
  is_deleted: boolean
  is_edited: boolean
  liked_by: LikedByUserId[]
  created_at: Date
  updated_at: Date | null
}

export interface ReadByUserId {
  user_id: string
  created_at?: Date
}

export interface LikedByUserId {
  user_id: string
  emotion: MessageEmotionType
  created_at?: Date
}

export interface UserLikedMessage {
  _id: MessageEmotionType & 'all'
  data: UserRes[]
}

export interface UserLikedMessageRes {
  [key: string]: UserRes[]
}

export interface MessageReplyPopulate {
  message_id: Omit<Message, 'user_id'> & {
    user_id: User
  }
  attachment_id?: Attachment
}

export type MessagePopulate = Omit<
  Message,
  'user_id' | 'reply_to' | 'attachments' | 'mention_to' | 'room_id'
> & {
  room_id: string
  user_id: User
  reply_to?: MessageReplyPopulate | undefined
  attachments: Attachment[]
  mention_to: User[]
}

export interface IdAndName {
  id: string
  name: string
}

export type MessageRes = Pick<Message, 'created_at'> &
  AuthorMessage & {
    id: string
    room_id: string
    is_author: boolean
    is_hidden: boolean
    product_id: number | null
    order_id: number | null
    reaction_count: number
    reactions: MessageEmotionType[]
    your_reaction: MessageEmotionType | null
    mention_to: { user_id: string; user_name: string }[]
    attachments: AttachmentRes[]
    text: string
    reply_to?: MessageReply | null
    location?: Lnglat | null
    is_read: boolean
  }

export interface ReactionMessageRes {
  [key: string]: UserRes & {
    reaction: MessageEmotionType
  }
}

export interface MessageUnreadCountQueryRes {
  _id: string
  message_unread_ids: string[]
}

export interface MessageUnreadCountRes {
  message_unread_count: number
  room_ids: string[]
}

export type LastMessage = Pick<MessageRes, 'id' | 'text' | 'is_author' | 'created_at'> & {
  user_id: string
  user_name: string
}

export type AttachmentType = 'image' | 'video'

export interface AuthorMessage {
  author_id: string
  author_name: string
  author_avatar: string | null
  author_socket_id: string | null
}

export interface MessageUser {
  user_id: string
  user_name: string
  user_avatar: string
}

export type MessageReply = AuthorMessage & {
  id: string
  text: string
  attachment: AttachmentRes | null
  created_at: Date
}

export type MessageType = 'attachment' | 'text' | 'location' | 'product' | 'order'

export type MessageEmotionType = 'like' | 'angry' | 'sad' | 'laugh' | 'heart' | 'wow'

export enum MessageEmotionEnum {
  like = 'like',
  angry = 'angry',
  sad = 'sad',
  laugh = 'laugh',
  heart = 'heart',
  wow = 'wow',
}

export interface GetMessagesInRoom extends QueryCommonParams {
  room_id: string
}

export interface UserReadMessage {
  user_id: string
  message_id: string
}

export interface UserReadLastMessage {
  user_id: string
  room_id: string
}

export interface UnlikeMessage {
  message_id: string
}

export interface UnlikeMessageService {
  message_id: string
  user_id: string
}

export interface LikeMessage extends UnlikeMessage {
  emotion: MessageEmotionType
}

export interface LikeMessageService {
  emotion: MessageEmotionType
  user_id: string
  message_id: string
}

export interface LikeMessageRes {
  message_id: string
  room_id: string
  user_id: string
  emotion: MessageEmotionType
}

export interface UnlikeMessageRes {
  message_id: string
  user_id: string
  room_id: string
}

export interface MessageDetailRes extends MessageRes {
  read_by_users: []
}

export interface GetMessagesByFilter extends QueryCommonParams {
  user_id: string
  filter: FilterQuery<Message>
}
