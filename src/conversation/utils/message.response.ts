import { compareTwoObjectId } from '@common/helpers'
import { toAttachmentListResponse, toAttachmentResponse } from '@common/utils'
import { toAuthorMessage } from '@user/utils'
import {
  LastMessage,
  LastMessagePopulate,
  Message,
  MessagePopulate,
  MessageReply,
  MessageReplyPopulate,
  MessageRes,
} from '../types'

export const toMessageReply = (data: MessageReplyPopulate): MessageReply => {
  const { message_id, attachment_id } = data

  return {
    id: message_id._id,
    created_at: data.message_id.created_at,
    text: toMessageText(message_id as any),
    attachment: attachment_id?._id ? toAttachmentResponse(attachment_id) : null,
    ...toAuthorMessage(data.message_id.user_id),
  }
}

export const toMessageResponse = (data: MessagePopulate, user_id: string): MessageRes => {
  const is_author = compareTwoObjectId(data.user_id._id, user_id)
  const your_reaction =
    data?.liked_by?.length > 0
      ? data?.liked_by?.find((item) => compareTwoObjectId(item.user_id, user_id))?.emotion || null
      : null
  const reactions = data?.liked_by?.length ? data?.liked_by?.map((item) => item.emotion) : []

  return {
    id: data._id,
    room_id: data.room_id,
    text: data?.text || '',
    product_id: data?.product_id || null,
    order_id: data?.order_id || null,
    attachments: data?.attachments?.length ? toAttachmentListResponse(data?.attachments) : [],
    location: data?.location || null,
    is_author,
    ...toAuthorMessage(data.user_id),
    your_reaction,
    reaction_count: data.liked_by?.length,
    reactions,
    mention_to: data?.mention_to?.map((item) => ({ user_id: item._id, user_name: item.user_name })),
    is_read: is_author
      ? data?.read_by?.length >= 2
      : data?.read_by?.some((item) => compareTwoObjectId(item.user_id, user_id)),
    reply_to: data?.reply_to?.message_id?._id ? toMessageReply(data.reply_to) : null,
    is_hidden: data.is_hidden,
    created_at: data.created_at,
  }
}

export const toMessageListResponse = (data: MessagePopulate[], user_id: string): MessageRes[] => {
  return data.map((item) => toMessageResponse(item, user_id))
}

export const toLastMessageResponse = (data: LastMessagePopulate, user_id: string): LastMessage => {
  return {
    id: data.id,
    text: toMessageText(data as any),
    created_at: data.created_at,
    user_id: data.user_id,
    user_name: data.user_name,
    is_author: compareTwoObjectId(user_id, data.user_id),
  }
}

export const toMessageText = (
  message: LastMessagePopulate | MessagePopulate | Message | MessageRes
): string => {
  if (message.attachments?.length) {
    return 'Hình ảnh'
  } else if (message?.location) {
    return 'Vị trí'
  } else if (message.order_id) {
    return 'Đơn hàng'
  } else if (message.product_id) {
    return 'Sản phẩm'
  }

  return message?.text || ''
}
