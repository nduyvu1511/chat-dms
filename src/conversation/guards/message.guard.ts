import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UserDocument } from '@user/models'
import { Observable } from 'rxjs'
import { Request } from 'express'

@Injectable()
export class MessageGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    try {
      const req = context.switchToHttp().getRequest() as Request
      const token = req.headers['authorization']?.split('Bearer ')[1]
      if (!token) return false

      const authUser = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      }) as UserDocument
      ;(req as any)._user = authUser

      return true
    } catch (error) {
      return false
    }
  }
}
