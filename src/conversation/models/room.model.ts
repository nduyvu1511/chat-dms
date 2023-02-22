import { Room, RoomTypeEnum } from '@conversation/types'
import { ObjectId } from 'mongodb'
import { Document, Schema } from 'mongoose'

const RoomSchema = new Schema<
  Omit<Room, 'leader' | 'last_message'> & { leader: ObjectId; last_message: ObjectId }
>(
  {
    name: { type: String, required: false, default: null },
    avatar: {
      type: String,
      default: null,
    },
    type: {
      type: String,
      enum: RoomTypeEnum,
      required: true,
    },
    messages: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Message',
        default: [],
        _id: false,
      },
    ],
    members: [
      {
        type: {
          _id: false,
          user_id: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
          },
          joined_at: {
            type: Schema.Types.Date,
            default: Date.now,
            required: false,
          },
          message_unreads: [
            {
              type: Schema.Types.ObjectId,
              ref: 'Message',
              default: [],
              _id: false,
            },
          ],
        },
        required: true,
        min: 2,
      },
    ],
    members_leaved: [
      {
        type: {
          _id: false,
          user_id: {
            type: Schema.Types.ObjectId,
            ref: 'User',
          },
          leaved_at: {
            type: Number,
            default: Date.now,
          },
        },
        default: [],
      },
    ],
    leader: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    last_message: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
    pinned_messages: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Message',
        default: [],
        _id: false,
      },
    ],
    is_deleted: {
      type: Boolean,
      default: false,
    },
    created_at: {
      type: Schema.Types.Date,
      default: Date.now,
    },
    updated_at: {
      type: Schema.Types.Date,
      default: Date.now,
    },
  },
  {
    collection: 'Rooms',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
)

export { RoomSchema }
export interface RoomDocument extends Document, Omit<Room, '_id'> {}
