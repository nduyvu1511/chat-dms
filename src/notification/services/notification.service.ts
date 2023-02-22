import { PaginationDto } from '@common/dtos'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { OneSignalService } from 'onesignal-api-client-nest'

@Injectable()
export class NotificationService {
  constructor(private readonly oneSignalService: OneSignalService) {}

  async viewNotifications(params: PaginationDto) {
    return await this.oneSignalService.viewNotifications({
      limit: params?.limit,
      offset: params?.offset,
      kind: 1,
    })
  }

  async createNotification(payload: object) {
    await this.oneSignalService.createNotification(payload).catch((error) => {
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST)
    })
  }
}
