import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { HoroscopeReadInputDto } from './dto/horoscope-data-input.dto';

@Injectable()
export class CalculateEngineService {
  private readonly logger = new Logger(CalculateEngineService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async calculate(horosCopeData: HoroscopeReadInputDto) {
    try {
      const path =
        this.configService.get<string>('engine_base_path') || '/analsye';

      const response = await firstValueFrom(
        this.httpService.post(path, horosCopeData),
      );

      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to communicate with Python Engine: ${error?.response?.data?.detail || error.message}`,
      );

      throw new InternalServerErrorException('somethign went wrong');
    }
  }
}
