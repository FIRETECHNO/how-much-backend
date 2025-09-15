import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<JobFormClass>;

@Schema()
export class JobFormClass {
  @Prop({
    type: String,
    required: true,
  })
  job: string;

  @Prop({
    type: String,
    required: true,
  })
  fullName: string;

  @Prop({
    type: String,
    required: true,
  })
  coverLetter: string;



  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  })
  author: mongoose.Schema.Types.ObjectId;
}

export const JobFormSchema = SchemaFactory.createForClass(JobFormClass);