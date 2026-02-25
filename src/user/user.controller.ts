import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRegisterDto } from 'src/auth/dto/user-register.dto';
import { HoroscopeReadInputDto } from './dto/horoscope-data-input.dto';
import { CalculateEngineService } from './calculation.service';
import { AccessAuthGuard } from 'src/auth/guards/access-token.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AccessAuthGuard)
  @Post('analyse')
  async analyse(@Body() horoscopeRead: HoroscopeReadInputDto, @Request() req) {
    return await this.userService.analyse(horoscopeRead, req?.user?.sub);
  }
}
