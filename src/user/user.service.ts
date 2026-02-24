import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model, Types } from 'mongoose';
import { UserRegisterDto } from 'src/auth/dto/user-register.dto';
import { CustomErrors } from 'src/auth/custom/custom-errors';
import * as argon2 from 'argon2';
import {
  RefreshToken,
  RefreshTokenDocument,
} from './schemas/refresh-token.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(RefreshToken.name)
    private readonly refreshModel: Model<RefreshTokenDocument>,
  ) {}

  //register a user in the db
  async create(dto: UserRegisterDto) {
    const email = dto.email.toLowerCase().trim();

    const userExists = await this.userModel.exists({ email });
    if (userExists) {
      throw new BadRequestException(CustomErrors.EmailAlreadyExists);
    }

    const hashedPassword = await argon2.hash(dto.password);

    return this.userModel.create({
      name: dto.name,
      email,
      hashedPassword,
    });
  }

  private async HashSomething(row: string): Promise<string> {
    return await argon2.hash(row);
  }

  async findUserByEmail(email: string) {
    return await this.userModel.findOne({ email });
  }

  //save refresh token
  async saveRefreshToken(token: string, user_id: Types.ObjectId) {
    const hashedRefreshToken = await this.HashSomething(token);
    await this.refreshModel.create({
      userd: user_id,
      tokenHashed: hashedRefreshToken,
    });
  }
}
