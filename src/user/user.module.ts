import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import {
  RefreshToken,
  RefreshTokenSchema,
} from './schemas/refresh-token.schema';
import { CalculateEngineService } from './calculation.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Horoscope, HoroscopeSchema } from './schemas/horoscopet.schema';
import { BullModule } from '@nestjs/bullmq';
import { AiAnalyserConsumer } from './consumers/ai-analyse.consumer';
import { GeminiService } from './gemini.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: RefreshToken.name, schema: RefreshTokenSchema },
      { name: Horoscope.name, schema: HoroscopeSchema },
    ]),

    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        baseURL: config.get<string>('engine_base_url'),
        timeout: 10000,
      }),
    }),

    BullModule.registerQueue({
      name: 'ai-analyse',
    }),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    CalculateEngineService,
    AiAnalyserConsumer,
    GeminiService,
  ],
  exports: [UserService],
})
export class UserModule {}
