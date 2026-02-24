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

  async loginUser(loginUserDto: UserLoginDto) {
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
    const acccessToken = await this.tokenService.signAccessToken(dbUser._id);
    const refreshToken = await this.tokenService.signRefreshToken(dbUser._id);
    //save hashed refresh token in db
    await this.userService.saveRefreshToken(refreshToken, dbUser._id);
    return {
      acccessToken,
      refreshToken,
    };
  }
}
