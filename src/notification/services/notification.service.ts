import { PaginationDto } from '@common/dtos'
import { MessageRes } from '@conversation/types'
import { toMessageText } from '@conversation/utils'
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

  async createMessageNotification(device_id: string, payload: MessageRes) {
    try {
      await this.oneSignalService.createNotification({
        contents: { en: toMessageText(payload) },
        priority: 2,
        headings: { en: 'Bạn có tin nhắn mới' },
        large_icon: payload.author_avatar,
        include_player_ids: [device_id],
        data: payload,
      })
    } catch (error) {
      console.log(error)
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST)
    }
  }
}
