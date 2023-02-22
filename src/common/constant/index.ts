export const DEFAULT_MESSAGE = 'Congratulation'
export const MESSAGES_LIMIT = 30
export const ROOMS_LIMIT = 30
export const USERS_LIMIT = 30
export const TAGS_LIMIT = 30
export const DEFAULT_LIMIT = 30

export const SELECT_USER = [
  '_id',
  'phone',
  'avatar',
  'gender',
  'bio',
  'role',
  'user_name',
  'date_of_birth',
  'is_online',
  'updated_at',
  'created_at',
  'offline_at',
  'socket_id',
]

export const SELECT_ROOM = [
  '_id',
  'name',
  'avatar',
  'type',
  'members',
  'leader',
  'last_message',
  'is_expired',
  'members_leaved',
  'created_at',
  'updated_at',
]

export enum WebsocketOnEvents {
  LOGIN = 'login',
  JOIN_ROOM = 'join_room',
  LEAVE_ROOM = 'leave_room',
  SEND_MESSAGE = 'send_message',
  READ_MESSAGE = 'read_message',
  START_TYPING = 'start_typing',
  STOP_TYPING = 'stop_typing',
  LIKE_MESSAGE = 'like_message',
  UNLIKE_MESSAGE = 'unlike_message',
}

export enum WebsocketEmitEvents {
  FRIEND_LOGOUT = 'friend_logout',
  LOGIN = 'login',
  FRIEND_LOGIN = 'friend_login',
  READ_ADD_MESSAGE = 'read_all_message',
  PARTNER_READ_ALL_MESSAGE = 'partner_read_all_message',
  RECEIVE_MESSAGE = 'receive_message',
  RECEIVE_UNREAD_MESSAGE = 'receive_unread_message',
  CONFIRM_READ_MESSAGE = 'confirm_read_message',
  START_TYPING = 'start_typing',
  STOP_TYPING = 'stop_typing',
  LIKE_MESSAGE = 'like_message',
  UNLIKE_MESSAGE = 'unlike_message',
  CREATE_ROOM = 'create_room',
  DELETE_ROOM = 'delete_room',
  MEMBER_LEAVE_ROOM = 'member_leave_room',
  MEMBER_JOIN_ROOM = 'member_join_room',
}

export const ACCESS_TOKEN_SECRET_KEY = 'ACCESS_TOKEN_SECRET_KEY'
export const ACCESS_TOKEN_EXPIRES_IN = 'ACCESS_TOKEN_EXPIRES_IN'

export const ONESIGNAL_MODULE_OPTIONS = 'ONESIGNAL_MODULE_OPTIONS'
