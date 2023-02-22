import { ObjectId } from 'mongodb'

export interface Token {
  _id: ObjectId
  user_id: string
  token: string
  type: TokenType
  created_at: Date
  expires_at: Date
}

export interface TokenRes {
  token: string
  expires_in: number
}

export type SaveToken = TokenRes & Pick<Token, 'user_id' | 'type'>

export type TokenType = 'refresh_token' | 'access_token'

export enum TokenEnum {
  refreshToken = 'refresh_token',
  accessToken = 'access_token',
}
