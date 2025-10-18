import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

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
    required: false,
  })
  coverLetter: string;

  @Prop({
    type: String,
    required: true,
  })
  phone: string;

  @Prop({
    type: String,
    required: false,
  })
  telegram: string;

  @Prop({
    type: String,
    required: false,
    default: "",
  })
  email: string;

  @Prop({
    type: Types.ObjectId,
    ref: "User",
    required: false,
    default: null
  })
  employeeId: Types.ObjectId

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

  @Prop({
    type: Date,
    required: false,
  })
  lastRaiseDate: Date

  @Prop({
    type: Number,
    required: false,
    default: null
  })
  salaryFrom: number | null

  @Prop({
    type: Number,
    required: false,
    default: null
  })
  salaryTo: number | null

  @Prop({
    type: String,
    required: true,
  })
  experience: string

  @Prop({
    type: String,
    required: true,
  })
  workFormat: string


  @Prop({
    type: Boolean,
    default: false
  })
  isApproved: Boolean
}

export const JobFormSchema = SchemaFactory.createForClass(JobFormClass);