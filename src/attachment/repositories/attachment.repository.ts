import { IMAGE_FORMAT_REGEX } from '@attachment/constant'
import { AttachmentDocument } from '@attachment/models'
import { Attachment, CreateAttachment, DeleteResource, UploadResourceRes } from '@attachment/types'
import { BaseRepository } from '@common/repositories'
import { AttachmentType } from '@conversation/types'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { v2 } from 'cloudinary'
import { Model } from 'mongoose'

@Injectable()
export class AttachmentRepository extends BaseRepository<AttachmentDocument> {
  constructor(
    @InjectModel('Attachment')
    private readonly attachmentModel: Model<AttachmentDocument>
  ) {
    super(attachmentModel)
  }

  async getAttachments(ids: string[]): Promise<Attachment[]> {
    return (await this.attachmentModel.find({ _id: { $in: ids } })) as Attachment[]
  }

  async createAttachment(params: UploadResourceRes): Promise<Attachment> {
    return this.attachmentModel.create({
      public_id: params.public_id,
      asset_id: params.asset_id,
      url: params.url,
      type: params.type,
      thumbnail_url: params.thumbnail_url,
    })
  }

  async createMultipeAttachment(attachments: UploadResourceRes[]) {
    return await Promise.all(
      attachments.map(async (item) => {
        return await this.createAttachment(item)
      })
    )
  }

  async createMultipleAttachment(params: CreateAttachment[]): Promise<Attachment[]> {
    return await Promise.all(
      params.map(async (item) => {
        return await this.createAttachment(item)
      })
    )
  }

  async uploadSingleAttachment(file: Express.Multer.File): Promise<UploadResourceRes | null> {
    const type: AttachmentType = file.originalname.match(IMAGE_FORMAT_REGEX) ? 'image' : 'video'

    const res = await v2.uploader.upload(file.path, {
      eager: [
        {
          quality: 'auto',
        },
        type === 'image'
          ? {
              crop: 'fill',
              quality: 'auto',
              width: 320,
              height: 320,
            }
          : {
              quality: 30,
              transformation: {
                crop: 'fill',
                quality: 'auto',
                width: 320,
                height: 320,
              },
            },
      ],
      resource_type: type,
      folder: type,
    })
    if (!res?.public_id) return null

    return {
      asset_id: res?.asset_id || res.public_id,
      public_id: res.public_id,
      url: res?.eager[0]?.secure_url || res.secure_url,
      thumbnail_url: res?.eager[1]?.secure_url || res.secure_url,
      type,
    }
  }

  async uploadMultipleAttachment(files: Express.Multer.File[]): Promise<UploadResourceRes[]> {
    const res = await Promise.all(
      files.map(async (item) => {
        return await this.uploadSingleAttachment(item)
      })
    )
    return res.filter((item) => item)
  }

  async deleteResource({ public_id, resource_type }: DeleteResource): Promise<boolean> {
    return !!(await v2.uploader.destroy(public_id, { resource_type }))
  }
}
