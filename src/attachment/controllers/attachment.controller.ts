import { FILE_FORMAT_REGEX } from '@attachment/constant'
import { AttachmentService } from '@attachment/services'
import { HttpResponse } from '@common/utils'
import {
  Controller,
  Delete,
  HttpException,
  HttpStatus,
  Param,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'
import { ApiTags } from '@nestjs/swagger'
import { AuthGuard } from '@user/guards'
import * as multer from 'multer'

@ApiTags('Attachment')
@Controller('attachment')
export class AttachmentController {
  constructor(private readonly attachmentService: AttachmentService) {}

  @Post('single')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.diskStorage({}),
      fileFilter(_, file, callback) {
        if (!file.originalname.match(FILE_FORMAT_REGEX)) {
          callback(
            new HttpException(
              'Only support png, jpg, JPG, PNG, webp, WEBP, mp4, mov format!',
              HttpStatus.BAD_REQUEST
            ),
            false
          )
        }

        callback(null, true)
      },
    })
  )
  async uploadSingleImage(@UploadedFile() file: Express.Multer.File) {
    try {
      const res = await this.attachmentService.uploadSingleFile(file)
      return new HttpResponse(res, 'Upload attachment successfully')
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST)
    }
  }

  fileFilter(_: any, file: Express.Multer.File, callback: any) {
    if (!file.originalname.match(FILE_FORMAT_REGEX)) {
      callback(
        new HttpException(
          'Only support png, jpg, JPG, PNG, webp, WEBP, mp4, mov format!',
          HttpStatus.BAD_REQUEST
        ),
        false
      )
    }

    callback(null, true)
  }

  @Post('multiple')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FilesInterceptor('file', 10, {
      storage: multer.diskStorage({}),
      limits: { files: 10 },
      fileFilter(_, file, callback) {
        if (!file.originalname.match(FILE_FORMAT_REGEX)) {
          callback(
            new HttpException(
              'Only support png, jpg, JPG, PNG, webp, WEBP, mp4, mov format!',
              HttpStatus.BAD_REQUEST
            ),
            false
          )
        }

        callback(null, true)
      },
    })
  )
  @Post('multiple')
  async uploadMultipleAttachments(@UploadedFiles() files: Express.Multer.File[]) {
    try {
      const res = await this.attachmentService.uploadMultipleFile(files)
      return new HttpResponse(res, 'Upload attachments successfully')
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteAttachment(@Param('id') attachment_id: string) {
    try {
      const res = await this.attachmentService.deleteAttachment(attachment_id)
      return new HttpResponse(res, 'Delete attachment successfully')
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST)
    }
  }
}
