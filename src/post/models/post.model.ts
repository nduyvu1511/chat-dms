import { PostSchema as IPostSchema } from '@post/types'
import { Document, Schema } from 'mongoose'

const PostSchema = new Schema<IPostSchema>(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    thumbnail: { type: Schema.Types.ObjectId, required: true, ref: 'Attachment' },
    content: { type: String, required: true },
    short_content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tags: [{ type: String, _id: false, default: [] }],
    category: { type: String, ref: 'Category', required: true },
    active: { type: Boolean, required: false, default: true },
  },
  {
    collection: 'Posts',
    timestamps: true,
  }
)

export { PostSchema }
export interface PostDocument extends Document, IPostSchema {}
