import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CalculateEngineService } from './calculation.service';
import { HoroscopeReadInputDto } from './dto/horoscope-data-input.dto';
import { nakshatraData } from './constants/nakshatra.data';
import {
  Horoscope,
  HoroscopeDocument,
  State,
} from './schemas/horoscopet.schema';
import { v4 as uuidv4 } from 'uuid';
import { buildAstrologyPrompt } from './util/prompt.generate';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(Horoscope.name)
    private horoscopeModel: Model<HoroscopeDocument>,
    private engine: CalculateEngineService,
    @InjectQueue('ai-analyse') private aiAnalyseQueue: Queue,
  ) {}

  //analyse horoscope
  async analyse(horoscopeData: HoroscopeReadInputDto) {
    const reading = await this.engine.calculate(horoscopeData);
    //get nakshathra according to the id
    const currentNakshatraInfo =
      nakshatraData[reading?.birth_details?.nakshatra_id];
    //save partial record in database with state as ai analysing
    const horoscopeModelResponse = await this.horoscopeModel.create({
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

  async getReading(job_id: string) {
    const record = await this.horoscopeModel.findOne({ job_id });
    if (!record) throw new NotFoundException('Reading not found');
    return { jobId: record.job_id, state: record.state, reading: record.reading };
  }
}
