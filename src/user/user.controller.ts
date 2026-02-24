import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRegisterDto } from 'src/auth/dto/user-register.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() userRegisterDto: UserRegisterDto) {
    return this.userService.create(userRegisterDto);
  }
}
