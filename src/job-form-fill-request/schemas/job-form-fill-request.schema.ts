import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export type JobFormFillRequestDocument = HydratedDocument<JobFormFillRequestClass>;

@Schema({ timestamps: true })
export class JobFormFillRequestClass {
  @Prop({
    type: String,
    required: true,
  })
  job: string;

  @Prop({
    type: Date,
    required: false,
    default: null
  })
  startDate: Date;

  @Prop({
    type: Date,
    required: false,
    default: null
  })
  endDate: Date;

  @Prop({
    type: Types.ObjectId,
    ref: "User",
    required: true,
  })
  employee: Types.ObjectId

  @Prop({
    type: Types.ObjectId,
    ref: "User",
    required: false,
    default: null
  })
  manager: Types.ObjectId
}

export const JobFormFillRequestSchema = SchemaFactory.createForClass(JobFormFillRequestClass);