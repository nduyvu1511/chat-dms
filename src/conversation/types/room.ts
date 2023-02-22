import { QueryCommonParams, ListRes, Lnglat } from '@common/types'
import { User } from '@user/types'
import { LastMessage, MessagePopulate, MessageRes } from './message'

export interface Room {
  _id: string
  name: string
  avatar: string
  type: RoomType
  members: RoomMember[]
  leader: string
  last_message: string
  pinned_messages: string[]
  members_leaved: MemberLeaved[]
  messages: string[]
  is_deleted: boolean
  created_at: Date
  updated_at: Date
}

export interface TopMember {
  user_id: string
  user_name: string
  avatar: string
  offline_at: string | null
}

export interface RoomRes {
  id: string
  name: string | null
  avatar?: string | null
  type: RoomType
  member_count: number
  message_unread_count: number
  last_message: LastMessage | null
  offline_at: string | null
  is_online: boolean
  top_members?: TopMember[]
}

export interface RoomInfoRes {
  room_id: string
  room_name: string | null
  room_avatar?: string | null
  room_type: RoomType
  member_count: number
}

export interface LastMessagePopulate {
  id: string
  text: string
  product_id?: number
  order_id?: number
  location: Lnglat | null
  attachments: string[]
  created_at: Date
  user_id: string
  user_name: string
  user_avatar: string
}

export type RoomPopulate = Pick<Room, 'type' | 'name'> & {
  id: string
  member_count: number
  avatar?: string
  top_members: TopMember[]
  last_message?: LastMessagePopulate
  message_unread_count: string[]
}

export type MemberRoomPopulate = {
  user_id: User
  joined_at: Date
  message_unread_ids: string[]
}

export type ToRoomListResponse = {
  data: RoomPopulate[]
  current_user: User
}

export type RoomDetailRes = Omit<RoomRes, 'top_members'> & {
  messages: ListRes<MessageRes[]>
  members: ListRes<RoomMemberRes[]>
}

export type RoomDetailPopulate = Omit<
  Room,
  'members' | 'pinned_messages' | 'messages' | 'leader'
> & {
  members: ListRes<User[]>
  pinned_messages?: ListRes<MessagePopulate[]>
  messages: ListRes<MessagePopulate[]>
  leader?: User
}

export interface GetRoomDetailService {
  room_id: string
  user: User
}

export enum RoomTypeEnum {
  group = 'group',
  single = 'single',
  admin = 'admin',
}

type RoomType = 'group' | 'single' | 'admin'

export interface RoomMember {
  user_id: string
  joined_at: number
  message_unreads: string[]
}

export interface MemberLeaved {
  user_id: string
  leaved_at: number
}

export type UpdateRoomInfo = {
  room_avatar?: string
  room_name?: string
}

export type UpdateRoomInfoService = UpdateRoomInfo & {
  room_id: string
}

export interface RoomMemberWithId {
  _id: string
  member_ids: RoomMember[]
}

export interface createSingleChat {
  partner_id: number
}

export interface CreateGroupChat {
  room_name: string
  room_avatar?: string
  member_ids: string[]
}

export type CreateSingleChatService = {
  partner: User
  user: User
  type?: 'single' | 'admin'
}

export interface QueryRoomParams extends QueryCommonParams {
  search_term?: string
  room_type?: RoomType | undefined
}

export interface QueryMembersInRoomParams extends QueryCommonParams {
  search_term?: string
}

export type RoomServiceParams = Exclude<Room, 'last_message' | ''> & {
  message?: MessagePopulate
}

export type RoomMemberRes = Pick<User, 'user_name' | 'offline_at'> & {
  id: string
  avatar: string | null
}

export type RoomDetailQueryRes = Room & {
  pinned_message?: MessagePopulate
  messages: MessagePopulate[]
}

export interface ToRoomStatus {
  data: User[]
  current_user: User
}

export interface ClearMessageUnread {
  room_id: string
}

export interface ClearMessageUnreadService extends ClearMessageUnread {
  user_id: string
}

export interface AddMemberInRoomService {
  user: User
  room: Room
}

export interface DeleteMemberFromRoomService extends AddMemberInRoomService {}

export interface AddMessageUnread {
  message_id: string
}

export interface AddMessageUnreadService extends AddMessageUnread {
  room_id: string
  user_id: string
}

export interface RoomTypingRes {
  user_id: string
  user_name: string
  room_id: string
}

export interface SoftDeleteRoomsByDependId {
  current_user_id: string
}
