import { User as IUser, User } from '@user/types'

declare global {
  namespace Express {
    interface Request {
      _user?: IUser
      _partner?: IUser
    }

    type NextFunction = Function
  }

  namespace socket {
    interface socket {
      data: User
    }

    type NextFunction = Function
  }
}

export * from './http'
export * from './common'
