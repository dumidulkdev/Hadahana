import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { HoroscopeReadInputDto } from './dto/horoscope-data-input.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('analyse')
  async analyse(@Body() horoscopeRead: HoroscopeReadInputDto) {
    return await this.userService.analyse(horoscopeRead);
  }

  @Get('reading/:jobId')
  async getReading(@Param('jobId') jobId: string) {
    return await this.userService.getReading(jobId);
  }
}
