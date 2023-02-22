import { Attachment, AttachmentRes } from '@attachment/types'
import { ListParams, ListRes, Tag, TagRes } from '@common/types'

export const toAttachmentResponse = (params: Attachment): AttachmentRes => {
  return {
    id: params?._id,
    thumbnail_url: params?.thumbnail_url || null,
    url: params?.url,
    type: params?.type,
  }
}

export const toAttachmentListResponse = (params: Attachment[]): AttachmentRes[] => {
  return params.map((item) => toAttachmentResponse(item))
}

export const toTagResponse = (params: Tag): TagRes => {
  return {
    tag_id: params._id,
    text: params.text,
  }
}

export const toTagListResponse = (params: Tag[]): TagRes[] => {
  return params.map((item) => toTagResponse(item))
}

export const toListResponse = (params: ListParams<any>): ListRes<any[]> => {
  const { data, limit, offset, total } = params

  return {
    limit,
    offset,
    total,
    has_more: data.length + offset < total,
    data,
  }
}

export const toDefaultListResponse = (): ListRes<[]> => ({
  data: [],
  limit: 0,
  offset: 0,
  total: 0,
  has_more: false,
})
