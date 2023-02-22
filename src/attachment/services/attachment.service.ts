import { AttachmentRepository } from '@attachment/repositories'
import { Attachment } from '@attachment/types'
import { toAttachmentListResponse, toAttachmentResponse } from '@common/utils'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'

@Injectable()
export class AttachmentService {
  constructor(private readonly attachmentRepository: AttachmentRepository) {}

  async uploadSingleFile(file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('Attachment not found', HttpStatus.BAD_REQUEST)
    }

    const attachment = await this.attachmentRepository.uploadSingleAttachment(file)
    if (!attachment?.asset_id) {
      throw new HttpException('Failed to upload file', HttpStatus.BAD_REQUEST)
    }

    const res = await this.attachmentRepository.createAttachment(attachment)
    return toAttachmentResponse(res)
  }

  async uploadMultipleFile(files: Express.Multer.File[]) {
    const attachments = await this.attachmentRepository.uploadMultipleAttachment(files)
    if (!attachments?.[0]?.asset_id) {
      throw new HttpException('Failed to upload files', HttpStatus.BAD_REQUEST)
    }

    const res = await this.attachmentRepository.createMultipleAttachment(attachments)
    return toAttachmentListResponse(res)
  }

  async getAttachmentById(attachment_id: string): Promise<Attachment> {
    const res = await this.attachmentRepository.findById(attachment_id)
    if (!res?._id) {
      throw new HttpException('Attachment not found', HttpStatus.BAD_REQUEST)
    }

    return res as Attachment
  }

  async deleteAttachment(attachment_id: string) {
    const attachment = await this.getAttachmentById(attachment_id)

    await this.attachmentRepository.deleteResource({
      public_id: attachment.public_id,
      resource_type: attachment.type,
    })

    await this.attachmentRepository.findOneAndDelete({ _id: attachment_id })

    return { attachment_id }
  }
}
