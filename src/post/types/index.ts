import { Attachment, AttachmentRes } from '@attachment/types'
import { User } from '@user/types'
import { ObjectId } from 'mongodb'

export interface CategorySchema {
  parent_id: ObjectId | null
  slug: string
  name: string
  image: ObjectId
  desc: string
  created_at: string
  updated_at: string
  active: boolean
}

export interface Category extends CategorySchema {
  _id: string
}

export type CategoryPopulate = Omit<Category, 'image'> & {
  image: Attachment
}

export interface CategoryRes {
  id: string
  name: string
  slug: string
  parent_id: string | null
  image: AttachmentRes
  desc: string
  created_at: string
  updated_at: string
}

export interface PostSchema {
  title: string
  sub_title: string
  content: string
  short_content: string
  author: ObjectId
  tags: string[]
  thumbnail: ObjectId
  slug: string
  created_at: string
  category: string
  active?: boolean
}

export interface Post extends PostSchema {
  _id: string
}

export type PostPopulate = Omit<Post, 'thumbnail' | 'category' | 'author'> & {
  thumbnail: Attachment
  category: Category
  author: User
}

export type PostRes = Pick<Post, 'sub_title' | 'title' | 'short_content' | 'content'> & {
  id: string
  slug: string
  author_id: string | null
  author_name: string | null
  tags: string[]
  thumbnail: AttachmentRes
  category_id: string | null
  category_name: string | null
  created_at: string
}

export type PostDetailRes = PostRes & {
  relatedPosts?: RelatedPost[]
}

export interface RelatedPost {
  post_id: string
  slug: string
  thumbnail: string
  subTitle: string
  short_content: string
  created_at: string
}

export interface Tag {
  _id: string
  title: string
}
