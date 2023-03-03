export interface HttpResponseType<T> {
  message: string
  success: boolean
  status_code: number
  data: T
}

export interface INotificationContent {
  contents?: object
  headings?: object
  subtitle?: object
  template_id?: string
  content_available?: boolean
  mutable_content?: boolean
}
