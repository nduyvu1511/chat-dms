export interface HttpResponseType<T> {
  message: string
  success: boolean
  status_code: number
  data: T
}
