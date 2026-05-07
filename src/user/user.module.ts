import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CalculateEngineService } from './calculation.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Horoscope, HoroscopeSchema } from './schemas/horoscopet.schema';
import { BullModule } from '@nestjs/bullmq';
import { AiAnalyserConsumer } from './consumers/ai-analyse.consumer';
import { DeepseekService } from './deepseek.service';

@Module({
  imports: [
    MongooseModule.forFeature([
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
    DeepseekService,
  ],
  exports: [UserService],
})
export class UserModule {}
