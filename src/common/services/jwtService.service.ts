import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { LoginDto } from '@user/dtos'
import { AuthService } from '@user/services'
import { ExtractJwt, Strategy } from 'passport-jwt'

@Injectable()
export class JwtService extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.ACCESS_TOKEN_SECRET_KEY,
    })
  }

  async validate(params: LoginDto) {
    const user = await this.authService.validateUser(params)

    if (!user) {
      throw new HttpException('Token không có hiệu lực', HttpStatus.UNAUTHORIZED)
    }

    return user
  }
}
