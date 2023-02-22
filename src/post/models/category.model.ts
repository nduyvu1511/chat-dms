import { CategorySchema as ICategorySchema } from '@post/types'
import { Document, Schema } from 'mongoose'

const CategorySchema = new Schema<ICategorySchema>(
  {
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    parent_id: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    image: { type: Schema.Types.ObjectId, default: null, ref: 'Attachment' },
    desc: { type: String, default: null },
    active: { type: Boolean, default: true },
  },
  {
    collection: 'Categories',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
)

export { CategorySchema }
export interface CategoryDocument extends Document, ICategorySchema {}
