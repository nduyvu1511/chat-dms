import { ObjectId } from 'mongodb'

export interface UploadResourceRes {
  url: string
  thumbnail_url: string
  public_id: string
  asset_id: string
  type: AttachmentType
  width: number
  height: number
}

export interface Attachment {
  _id: string
  url: string
  thumbnail_url?: string
  type: AttachmentType
  height: number
  width: number
  public_id: string
  asset_id: string
  created_at: Date
  updated_at: Date
}

export enum AttachmentTypeEnum {
  video = 'video',
  image = 'image',
}

export interface UploadSingleVideo {
  file: Express.Multer.File
  widthThumbnail?: number
  heightThumbnail?: number
}

export interface UploadMultipleVideo {
  files: Express.Multer.File[]
  folder: string
}

export interface UploadMultipleImage extends UploadMultipleVideo {
  widthThumbnail?: number
  heightThumbnail?: number
}

type AttachmentType = 'image' | 'video'

export type AttachmentRes = Pick<Attachment, 'url' | 'type' | 'width' | 'height'> & {
  id: string
  thumbnail_url: string | null
}

export type CreateAttachment = UploadResourceRes & Pick<Attachment, 'type'>

export type UpdateAttachment = Partial<
  Pick<Attachment, 'type' | 'url' | 'thumbnail_url' | 'updated_at'>
> & {
  attachment_id: ObjectId
}

export interface SaveImage {
  thumbnail_url: string
  url: string
  public_id: string
}

export interface DeleteResource {
  public_id: string
  resource_type: AttachmentType
}
