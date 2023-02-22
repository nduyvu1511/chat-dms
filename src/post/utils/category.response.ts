import { toAttachmentResponse } from '@common/utils'
import { CategoryPopulate, CategoryRes } from '@post/types'

export const toCategoryResponse = (post: CategoryPopulate): CategoryRes => {
  return {
    id: post._id,
    slug: post.slug,
    image: toAttachmentResponse(post.image),
    created_at: post?.created_at,
    desc: post?.desc || null,
    name: post.name,
    parent_id: post.parent_id.toString() || null,
    updated_at: post?.updated_at || null,
  }
}

export const toCategoryListResponse = (posts: CategoryPopulate[]): CategoryRes[] => {
  return posts.map((item) => toCategoryResponse(item))
}
