import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common'
import { UserRepository } from '@user/repositories'
import { User } from '@user/types'
import { Request } from 'express'

@Injectable()
export class UserGuard implements CanActivate {
  constructor(private readonly userRepository: UserRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const req = context.switchToHttp().getRequest() as Request
      const user = (await this.userRepository.findById(req._user?._id.toString())) as User
      if (!user?._id) {
        throw new HttpException('User not found', HttpStatus.UNAUTHORIZED)
      }

      req._user = user
      return true
    } catch (error) {
      return false
    }
  }
}
