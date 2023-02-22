import { QueryCommonParams } from '@common/types'
import { FilterQuery } from 'mongoose'

export interface User {
  _id: string
  user_name: string
  role: UserRoleType
  avatar: string
  password: string
  device_id: string
  phone: string
  user_id: number
  blocked_users: number[]
  friends: string[]
  room_joineds: string[]
  message_unread_count: number
  created_at: Date
  updated_at: Date
  offline_at: Date
  room_blockeds: string[]
  socket_id: string
}

export type UserRes = Pick<User, 'offline_at' | 'role' | 'phone' | 'user_name'> & {
  id: string
  avatar: string | null
  socket_id: string
  room_id?: string
  is_yourself?: boolean
  message_unread_count?: number
}

export type UserData = UserRes & {
  user_chatted_with_ids: string[]
  room_joined_ids: string[]
}

export type CreateUserParams = Pick<User, 'user_name' | 'role' | 'phone' | 'user_id'> & {
  user_id: string
  avatar: string
  // password: string
}

export type UpdateProfile = Partial<
  Pick<User, 'user_name'> & {
    avatar: string
  }
>

export type UpdateProfileService = UpdateProfile & { user: User }

export type GetTokenParams = Pick<User, 'user_id' | 'phone' | 'device_id'>

export type UserRoleType = 'th' | 'nvkd' | 'npp' | 'gsbh' | 'asm'

export enum UserRole {
  th = 'th',
  nvkd = 'nvkd',
  npp = 'npp',
  gsbh = 'gsbh',
  asm = 'asm',
}

export type Gender = 'male' | 'female' | 'no_info' | ''

export type UserLoginRes = UserRes & { access_token: string; refresh_token: string }

export type changeUserStatusParams = {
  user_id: string
  socket_id: string
  is_online: boolean
}

export type BlockUserStatus = 'block' | 'unblock'
export type BlockOrUnBlockUserParams = {
  user_id: string
  partner_id: string
  status: BlockUserStatus
}

export type getUserBlockListParams = Pick<User, 'blocked_users'> & QueryCommonParams

export interface LoginParams {
  phone: string
  password: string
  device_id: string
}

export interface LoginSocket {
  socket_id: string
}

export type RegisterParams = Pick<User, 'user_id' | 'phone' | 'password' | 'role'>

export interface CreatePasswordParams {
  new_password: string
  confirm_new_password: string
}

export interface ChangePasswordParams extends CreatePasswordParams {
  current_password: string
}

export type CreatePasswordServiceParams = CreatePasswordParams & {
  _id: string
}

export type ChangePasswordServiceParams = ChangePasswordParams & {
  _id: string
}

export type GetUserByFilter = Partial<QueryCommonParams> & {
  filter: FilterQuery<User>
}

export type GetUsersLiked = Partial<QueryCommonParams> & {
  filter: FilterQuery<User>
}

export type GetUsersLikedMessage = Partial<QueryCommonParams> & {
  message_id: string
}

export interface ChangeUserStatusBySocketId {
  socket_id: string
  is_online: boolean
}

export interface SetUserIdsChattedWith {
  user_ids: string[]
  type: 'add' | 'delete'
}

export interface LoginToSocket {
  socket_id: string
  user_id: string
  // socket: Socket<any>
}

export interface UserSocketId {
  user_id: string
  socket_id: string
  device_id: string
  room_joineds: string[]
  role: UserRoleType
}

export interface RequestRefreshToken {
  refresh_token: string
  user: User
}

export interface TopMember {
  user_id: string
  user_avatar: string
  user_name: string
  is_online: boolean
}

export type FriendStatusRes = {
  user_id: string
  room_ids: string[]
}
