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
import { CalculateEngineService } from './calculation.service';
import { HoroscopeReadInputDto } from './dto/horoscope-data-input.dto';
import { nakshatraData } from './constants/nakshatra.data';
import { read } from 'fs';
import {
  Horoscope,
  HoroscopeDocument,
  State,
} from './schemas/horoscopet.schema';
import { v4 as uuidv4, v1 as uuidv1, v3 as uuidv3, v5 as uuidv5 } from 'uuid';
import { buildAstrologyPrompt } from './util/prompt.generate';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(RefreshToken.name)
    private readonly refreshModel: Model<RefreshTokenDocument>,
    @InjectModel(Horoscope.name)
    private horoscopeModel: Model<HoroscopeDocument>,
    private engine: CalculateEngineService,
    @InjectQueue('ai-analyse') private aiAnalyseQueue: Queue,
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

  //analyse horoscope
  async analyse(horoscopeData: HoroscopeReadInputDto, user_id: string) {
    const reading = await this.engine.calculate(horoscopeData);
    //get nakshathra according to the id
    const currentNakshatraInfo =
      nakshatraData[reading?.birth_details?.nakshatra_id];
    //save partial record in database with state as ai analysing
    const horoscopeModelResponse = await this.horoscopeModel.create({
      userId: user_id,
      job_id: uuidv4().toString(),
    });
    //generate enhanced prompt with data
    const AIBuilderPrompt = buildAstrologyPrompt({
      reading,
      currentNakshatraInfo,
    });
    //add job to the ai-analyse queae
    await this.aiAnalyseQueue.add(
      'ai-analyse',
      {
        prompt: AIBuilderPrompt,
      },
      { jobId: horoscopeModelResponse.job_id, delay: 2000 },
    );
    return {
      job_id: horoscopeModelResponse.job_id,
      state: horoscopeModelResponse.state,
    };
  }

  //update user readings to the db
  async updateHoroscopeReadingsDb(reading, job_id) {
    const filter = { job_id };
    const update = { $set: { reading, state: State.COMPLETE } };
    await this.horoscopeModel.updateOne(filter, update);
  }
}
