import { ObjectId } from 'mongodb'
import { Schema, Document } from 'mongoose'
import { User, UserRole } from '@user/types/user.types'

const UserSchema = new Schema<User>(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    user_id: {
      type: Number,
      required: true,
      unique: true,
    },
    user_name: {
      type: String,
      required: true,
      minlength: 1,
    },
    role: {
      type: String,
      enum: UserRole,
      required: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    blocked_users: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: [],
      },
    ],
    room_joineds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Room',
        default: [],
      },
    ],
    friends: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: [],
        _id: false,
      },
    ],
    password: {
      type: String,
      default: null,
    },
    room_blockeds: [{ type: ObjectId, ref: 'Room', default: [] }],
    device_id: { type: String, default: null },
    socket_id: { type: String, default: null },
    message_unread_count: {
      type: Number,
      default: 0,
    },
    offline_at: {
      type: Date,
      default: null,
    },
  },
  { collection: 'Users', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
)

export { UserSchema }
export interface UserDocument extends Document, Omit<User, '_id'> {}
