import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { DeepseekService } from '../deepseek.service';
import { log } from 'console';
import { UserService } from '../user.service';

@Processor('ai-analyse', { concurrency: 1 })
export class AiAnalyserConsumer extends WorkerHost {
  private readonly logger = new Logger(AiAnalyserConsumer.name);
  constructor(
    private readonly llmService: DeepseekService,
    private readonly userService: UserService,
  ) {
    super();
  }

  async process(job: Job): Promise<any> {
    const { prompt } = job.data;
    this.logger.log(`job recivied job id - ${job.id}`);
    const readings = await this.llmService.generateAstrologyReading(prompt);
    console.log(readings);
    await this.userService.updateHoroscopeReadingsDb(readings, job.id);
    this.logger.log('job finished' + job.id);
    return {};
  }
}
