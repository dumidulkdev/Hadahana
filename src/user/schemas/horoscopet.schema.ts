import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type HoroscopeDocument = HydratedDocument<Horoscope>;

export enum State {
  AI_ANALYSE = 'AI_ANALYSE',
  COMPLETE = 'COMPLETE',
  FAILED = 'FAILED',
}

@Schema({ timestamps: true })
export class Horoscope {
  @Prop({ type: String })
  job_id: string;

  @Prop({ default: '' })
  reading: string;

  @Prop({ type: String, enum: State, default: State.AI_ANALYSE })
  state: State;
}

export const HoroscopeSchema = SchemaFactory.createForClass(Horoscope);
