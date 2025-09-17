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
    type: Object,
    required: true
  })
  video: {
    src: string
  };
}

export const JobFormSchema = SchemaFactory.createForClass(JobFormClass);