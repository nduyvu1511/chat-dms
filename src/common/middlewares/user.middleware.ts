import { HttpException, HttpStatus, Injectable, Module, NestMiddleware } from '@nestjs/common'
import { UserRepository } from '@user/repositories'
import { User } from '@user/types'
import { UserModule } from '@user/user.module'
import { NextFunction, Request, Response } from 'express'

@Module({
  imports: [UserModule],
})
@Injectable()
export class UserMiddleware implements NestMiddleware {
  constructor(private readonly userRepository: UserRepository) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (await this.userRepository.findById(req._user?._id.toString())) as User
      if (!user?._id) {
        throw new HttpException('User not found', HttpStatus.UNAUTHORIZED)
      }

      req._user = user
      next()
    } catch (error) {
      return false
    }
  }
}
