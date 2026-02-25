import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserRegisterDto } from './dto/user-register.dto';
import { UserLoginDto } from './dto/user-login.dto';
import { LoginResponse } from './dto/login-response-dto';
import { AccessAuthGuard } from './guards/access-token.guard';
import { RefreshAuthGuard } from './guards/refresh-token.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerUserDto: UserRegisterDto) {
    return await this.authService.create(registerUserDto);
  }

  @Post('signin')
  async signin(@Body() userLoginDto: UserLoginDto): Promise<LoginResponse> {
    const res = await this.authService.loginUser(userLoginDto);
    return {
      message: 'Login succuss!',
      ...res,
    };
  }

  //refresh token get route
  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  async refresh(@Request() request) {
    return await this.authService.revokeRefreshToken(request?.user);
  }
}
