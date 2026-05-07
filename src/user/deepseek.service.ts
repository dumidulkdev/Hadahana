import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class DeepseekService {
  private readonly logger = new Logger(DeepseekService.name);
  private openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.getOrThrow<string>('deepseek_api_key');

    if (!apiKey) {
      this.logger.error(
        'DEEPSEEK_API_KEY is not defined in environment variables',
      );
    }

    this.openai = new OpenAI({
      baseURL: 'https://api.deepseek.com/v1',
      apiKey: apiKey,
    });
  }

  async generateAstrologyReading(prompt: string): Promise<string> {
    try {
      const modelName = this.configService.get<string>('deepseek_model') || 'deepseek-chat';
      
      const response = await this.openai.chat.completions.create({
        model: modelName,
        messages: [{ role: 'user', content: prompt }],
      });

      return response.choices[0].message.content || '';
    } catch (error: any) {
      this.logger.error(
        `Failed to generate reading from DeepSeek API: ${error.message}`,
      );
      throw new InternalServerErrorException('internal server errror');
    }
  }
}
