import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRegisterDto } from './dto/user-register.dto';
import { UserService } from 'src/user/user.service';
import { UserLoginDto } from './dto/user-login.dto';
import { CustomErrors } from './custom/custom-errors';
import * as argon2 from 'argon2';
import { TokenService } from './token.service';
import { LoginResponse } from './dto/login-response-dto';
import { Types } from 'mongoose';
import { RefreshTokenResponse } from './dto/refresh-response.dto';

@Injectable()
export class AuthService {
  //initiate user AuthService
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) {}
  //register a user in the db
  async create(registerUserDto: UserRegisterDto) {
    return await this.userService.create(registerUserDto);
  }

  async loginUser(loginUserDto: UserLoginDto): Promise<LoginResponse> {
    const { email, password } = loginUserDto;
    //find user by id
    const dbUser = await this.userService.findUserByEmail(email);
    //check user is exixts
    if (!dbUser) {
      throw new NotFoundException(CustomErrors.UserEmailNotFound);
    }
    //compare password
    const isMatched = await argon2.verify(dbUser.hashedPassword, password);
    //password not match state
    if (!isMatched) {
      throw new UnauthorizedException(CustomErrors.WrongCredentials);
    }
    //generate tokens
    const accessToken = await this.tokenService.signAccessToken(dbUser._id);
    const refreshToken = await this.tokenService.signRefreshToken(dbUser._id);
    //delete previous refresh records if have
    await this.tokenService.deleteRefreshToken(dbUser._id);
    //save hashed refresh token in db
    await this.userService.saveRefreshToken(refreshToken, dbUser._id);
    return {
      accessToken,
      refreshToken,
    };
  }

  async revokeRefreshToken(user: any): Promise<RefreshTokenResponse> {
    const { user_id, refresh_token } = user;
    // get user refresh token from database
    const dbuser = await this.tokenService.findRefreshTokenFromUserId(user_id);
    //compare user sent token with db saved hash
    if (dbuser) {
      const isMatched = await argon2.verify(dbuser.tokenHashed, refresh_token);
      //delete refresh token from db
      await this.tokenService.deleteRefreshToken(new Types.ObjectId(user_id));
      //generate enw refresh and access tokens
      const accessToken = await this.tokenService.signAccessToken(
        new Types.ObjectId(user_id),
      );
      const refreshToken = await this.tokenService.signRefreshToken(
        new Types.ObjectId(user_id),
      );
      await this.userService.saveRefreshToken(
        refreshToken,
        new Types.ObjectId(user_id),
      );
      return {
        message: 'revoked',
        accessToken,
        refreshToken,
      };
    } else {
      throw new UnauthorizedException(CustomErrors.Unauthorized);
    }
  }
}
