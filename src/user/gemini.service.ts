import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private genAI: GoogleGenerativeAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.getOrThrow<string>('gen_ai_api_key');
    console.log(apiKey);

    if (!apiKey) {
      this.logger.error(
        'GEMINI_API_KEY is not defined in environment variables',
      );
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateAstrologyReading(prompt: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.5-pro',
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;

      const text = response.text();

      return text;
    } catch (error) {
      this.logger.error(
        `Failed to generate reading from Gemini API: ${error.message}`,
      );
      throw new InternalServerErrorException('internal server errror');
    }
  }
}
