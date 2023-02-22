import { Message } from '@conversation/types'
import { Document, Schema } from 'mongoose'

const MessageSchema = new Schema<Message>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    room_id: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
    text: {
      type: String,
      trim: true,
      default: null,
    },
    location: {
      type: {
        lng: String,
        lat: String,
      },
      default: null,
    },
    product_id: {
      type: Number,
      default: null,
    },
    order_id: {
      type: Number,
      default: null,
    },
    attachments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Attachment',
        _id: false,
        default: [],
      },
    ],
    mention_to: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        _id: false,
        default: [],
      },
    ],
    reply_to: {
      type: {
        message_id: {
          type: Schema.Types.ObjectId,
          ref: 'Message',
          required: true,
        },
        attachment_id: {
          type: Schema.Types.ObjectId,
          ref: 'Attachment',
          required: false,
          default: null,
        },
      },
      default: null,
    },
    read_by: [
      {
        type: {
          user_id: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
          },
          created_at: {
            type: Date,
            required: false,
            default: Date.now,
          },
          _id: false,
        },
        default: [],
      },
    ],
    liked_by: [
      {
        type: {
          user_id: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
          },
          emotion: {
            type: String,
            enum: ['like', 'angry', 'sad', 'laugh', 'heart', 'wow'],
          },
          _id: false,
        },
        default: [],
      },
    ],
    is_hidden: {
      type: Boolean,
      default: false,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    is_edited: {
      type: Boolean,
      default: false,
    },
    created_at: {
      type: Schema.Types.Date,
      default: Date.now,
    },
    updated_at: {
      type: Schema.Types.Date,
      default: null,
    },
  },
  {
    collection: 'Messages',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
)

export { MessageSchema }
export interface MessageDocument extends Document, Omit<Message, '_id'> {}
