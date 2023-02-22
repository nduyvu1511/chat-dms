import { Token, TokenEnum } from '@user/types'
import { Schema } from 'mongoose'

const TokenSchema = new Schema<Omit<Token, '_id'>>(
  {
    user_id: {
      type: String,
      ref: 'Users',
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
    },
    expires_at: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: TokenEnum,
    },
  },
  {
    collection: 'Tokens',
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
)

TokenSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 })

export interface TokenDocument extends Document, Omit<Token, '_id'> {}

export { TokenSchema }
