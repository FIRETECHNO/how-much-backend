import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<JobReservationClass>;

@Schema({ timestamps: true })
export class JobReservationClass {
  @Prop({
    type: Date,
    required: true,
  })
  startDate: Date;

  @Prop({
    type: Types.ObjectId,
    ref: "JobForm",
    required: true
  })
  jobFormId: Types.ObjectId

  @Prop({
    type: Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  })
  employerId: Types.ObjectId

  @Prop({
    type: Types.ObjectId,
    ref: "User",
    index: true,
    required: true,
  })
  employeeId: Types.ObjectId
}

export const JobReservationSchema = SchemaFactory.createForClass(JobReservationClass);

JobReservationSchema.index({ employerId: 1, employeeId: 1, startDate: -1 }, { expires: 3 * 24 * 60 * 60 * 1000 });