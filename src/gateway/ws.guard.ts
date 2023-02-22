import { CanActivate, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UserDocument } from '@user/models'
import { Observable } from 'rxjs'

@Injectable()
export class WsGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: any): boolean | any | Promise<boolean | any> | Observable<boolean | any> {
    const token = context.args[0].handshake.headers.authorization?.split(' ')?.[1]
    try {
      const authUser = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      }) as UserDocument

      context.args[0].data = authUser

      return true
    } catch (ex) {
      console.log(ex)
      return false
    }
  }
}
