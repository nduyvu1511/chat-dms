import { toAttachmentResponse } from '@common/utils'
import { CategoryPopulate, CategoryRes } from '@post/types'

export const toCategoryResponse = (category: CategoryPopulate): CategoryRes => {
  console.log(category)

  return {
    id: category._id,
    slug: category.slug,
    image: toAttachmentResponse(category.image),
    created_at: category?.created_at,
    desc: category?.desc || null,
    name: category.name,
    parent_id: category?.parent_id?.toString() || null,
    updated_at: category?.updated_at || null,
  }
}

export const toCategoryListResponse = (posts: CategoryPopulate[]): CategoryRes[] => {
  return posts.map((item) => toCategoryResponse(item))
}
