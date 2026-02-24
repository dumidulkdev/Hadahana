import { Prop, Schema } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { User } from "./user.schema";

export type HoroscopeDocument = HydratedDocument<Horoscope>

@Schema({ timestamps: true })
export class Horoscope{
	@Prop({ type: Types.ObjectId, ref: User.name, index: true, required: true })
	userId: Types.ObjectId;

	@Prop({ required: true })
	reading:string

}
