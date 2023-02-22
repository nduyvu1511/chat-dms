import { DEFAULT_MESSAGE } from '@common/constant'
import { HttpResponseType } from '@common/types'

export class HttpResponse<T> implements HttpResponseType<T> {
  message: string = DEFAULT_MESSAGE
  success: boolean
  status_code: number
  data: T

  constructor(data: T, message = DEFAULT_MESSAGE, status_code = 200, success = true) {
    this.message = message
    this.success = success
    this.status_code = status_code
    this.data = data
  }
}
