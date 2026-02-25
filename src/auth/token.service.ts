import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  RefreshToken,
  RefreshTokenDocument,
} from 'src/user/schemas/refresh-token.schema';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectModel(RefreshToken.name)
    private readonly refreshModel: Model<RefreshTokenDocument>,
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
        secret: this.configService.getOrThrow<string>('jwt_refresh_token'),
        expiresIn: '7d',
      },
    );
  }

  async deleteRefreshToken(user_id: Types.ObjectId) {
    await this.refreshModel.findOneAndDelete({ userd: user_id });
  }

  async findRefreshTokenFromUserId(user_id: string) {
    return await this.refreshModel.findOne({
      userd: new Types.ObjectId(user_id),
    });
  }
}
