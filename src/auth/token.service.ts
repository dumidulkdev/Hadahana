import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Types } from 'mongoose';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  //sign access token
  async signAccessToken(user_id: Types.ObjectId): Promise<string> {
    return await this.jwtService.signAsync({ sub: user_id.toString() });
  }
  // sign refresh token
  async signRefreshToken(user_id: Types.ObjectId): Promise<string> {
    return await this.jwtService.signAsync(
      { sub: user_id.toString() },
      {
        secret: this.configService.getOrThrow<string>('jwt_access_token'),
        expiresIn: '7d',
      },
    );
  }
  // validate refresh token
  // validate access token
}
