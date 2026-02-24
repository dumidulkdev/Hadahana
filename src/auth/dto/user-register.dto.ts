import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Match } from '../custom/custom-password-match.validator';

export class UserRegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'atleaste 6 characters are required for password' })
  password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'atleaste 6 characters are required for password' })
  @Match('password', { message: 'password do not match' })
  confirmPassword: string;
}
