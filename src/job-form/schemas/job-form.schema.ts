import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type JobFormDocument = HydratedDocument<JobFormClass>;

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
    type: String,
    required: true,
  })
  phone: string;
  @Prop({
    type: String,
    required: true,
  })
  telegram: string;



  @Prop({
    type: Object,
    required: true
  })
  video: {
    src: string
  };

  @Prop({
    type: Date,
    required: false
  })
  lastReservationDate: Date
}

export const JobFormSchema = SchemaFactory.createForClass(JobFormClass);