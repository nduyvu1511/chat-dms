import { compareTwoObjectId } from '@common/helpers'
import { User } from '@user/types'
import * as _ from 'lodash'
import { Room, RoomMemberRes, RoomPopulate, RoomRes, TopMember, ToRoomStatus } from '../types'
import { toLastMessageResponse } from './message.response'

export const toRoomResponse = (data: RoomPopulate, user_id: string): RoomRes => {
  let name = ''
  let avatar: string | null = data?.avatar || null

  if (data.type === 'group') {
    name = data?.name || data.top_members.map((item) => item.user_name)?.join(', ')
  } else {
    const partner = data.top_members?.find((item) => !compareTwoObjectId(item.user_id, user_id))
    name = partner?.user_name || ''
    avatar = partner?.avatar || null
  }

  const offline_at = data.top_members.filter(
    (item) => !compareTwoObjectId(item.user_id, user_id)
  )?.[0]?.offline_at

  return {
    id: data.id,
    name,
    avatar,
    type: data.type,
    is_online: !offline_at,
    offline_at,
    message_unread_count: data?.message_unread_count?.length || 0,
    member_count: data.member_count,
    last_message: data?.last_message?.id ? toLastMessageResponse(data.last_message, user_id) : null,
    top_members: data.top_members,
  }
}

export const toRoomOfflineAt = ({
  current_user_id,
  data,
}: {
  data: User[] | RoomMemberRes[] | TopMember[]
  current_user_id: string
}): string | null => {
  return (
    _.orderBy(
      [...data].filter(
        (item) =>
          (
            (item as User)._id ||
            (item as RoomMemberRes).id ||
            (item as TopMember).user_id
          ).toString() !== current_user_id.toString()
      ),
      (item) => item?.offline_at || '',
      ['desc']
    )[0]?.offline_at || null
  )
}

export const toMessageUnreadCount = (data: Room, user_id: string): number => {
  return (
    data.members?.find((item) => compareTwoObjectId(item.user_id, user_id))?.message_unreads
      ?.length || 0
  )
}

export const toRoomStatus = ({ current_user, data }: ToRoomStatus): boolean => {
  return data
    .filter((item) => !compareTwoObjectId(item._id, current_user._id))
    .some((item) => !item.offline_at)
}

export const toRoomListResponse = (data: RoomPopulate[], user_id: string): RoomRes[] => {
  return data.map((item) => toRoomResponse(item, user_id))
}

export const toRoomMemberOnlineCount = (params: { is_online: boolean }[]) => {
  return params.reduce((a, b) => a + (b.is_online ? 1 : 0), 0) || 1
}

export const toRoomMemberResponse = (data: User): RoomMemberRes => ({
  id: data._id.toString(),
  user_name: data?.user_name || '',
  avatar: data?.avatar || null,
  offline_at: data?.offline_at || null,
})

export const toRoomMemberListResponse = (data: User[]): RoomMemberRes[] => {
  return data.map((item) => toRoomMemberResponse(item))
}
