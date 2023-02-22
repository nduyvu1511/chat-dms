import { DEFAULT_MESSAGE } from '../constant'

interface HTTPErrorType {
  message: string
  success?: boolean
  status_code?: number
  data?: any
}

export class HTTPError implements HTTPErrorType {
  message: string = DEFAULT_MESSAGE
  success = false
  status_code = 400
  data = null

  constructor(message: string, status_code = 400, success = false, data = null) {
    this.message = message
    this.success = success
    this.status_code = status_code
    this.data = data
  }
}
