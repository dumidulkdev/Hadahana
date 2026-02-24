import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';

@Module({
	imports: [AuthModule, ConfigModule.forRoot({
		isGlobal: true,
		load:[configuration]
	}), MongooseModule.forRootAsync({
		inject: [ConfigService],
		useFactory: (config: ConfigService) => ({
			uri:config.get<string>('database_uri')
		})
  }), UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
