import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from './user.schema';

export type RefreshTokenDocument = HydratedDocument<RefreshToken>;

@Schema({ timestamps: true })
export class RefreshToken {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  userd: Types.ObjectId;

  @Prop({ required: true })
  tokenHashed: string;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
