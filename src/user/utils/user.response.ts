import { AuthorMessage, TopMember } from '@conversation/types'
import { User, UserData, UserRes } from '@user/types'

export type ToUserResponse = User & {
  current_user_id?: string
}

export function toUserResponse(data: ToUserResponse): UserRes {
  return {
    id: data._id.toString(),
    phone: data?.phone,
    user_name: data?.user_name,
    avatar: data.avatar,
    role: data?.role,
    socket_id: data?.socket_id,
    offline_at: data?.offline_at,
    is_yourself: data._id.toString() === data.current_user_id,
    message_unread_count: data?.message_unread_count || 0,
  }
}

export const toUserDataReponse = (data: User): UserData => {
  return {
    ...toUserResponse(data),
    user_chatted_with_ids: (data?.friends || []) as any,
    room_joined_ids: data?.room_joineds || [],
  }
}

export const toAuthorMessage = (data: User): AuthorMessage => {
  return {
    author_id: data._id.toString(),
    author_name: data?.user_name || '',
    author_avatar: data?.avatar || null,
    author_socket_id: data?.socket_id || null,
  }
}

export const toUserListResponse = (data: User[]): UserRes[] => {
  return data.map((item) => toUserResponse(item))
}

export const toTopMemberListResponse = (data: User[]): TopMember[] => {
  console.log(data)
  return data.map((item) => ({
    user_id: item._id,
    user_name: item.user_name,
    avatar: item.avatar,
    offline_at: (item?.offline_at as any) || null,
  }))
}
