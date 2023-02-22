import { toAttachmentResponse } from '@common/utils'
import { PostPopulate, PostRes } from '@post/types'

export const toPostResponse = (post: PostPopulate): PostRes => {
  return {
    id: post._id,
    slug: post.slug,
    title: post.title,
    thumbnail: toAttachmentResponse(post.thumbnail),
    sub_title: post.sub_title,
    short_content: post.short_content,
    content: post.content,
    author_id: post.author._id,
    author_name: post.author?.user_name || null,
    category_id: post.category?._id || null,
    category_name: post.category?.name || null,
    tags: post.tags,
    created_at: post.created_at,
  }
}

export const toPostListResponse = (posts: PostPopulate[]): PostRes[] => {
  return posts.map((item) => toPostResponse(item))
}
