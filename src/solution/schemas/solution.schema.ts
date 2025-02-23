import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type SolutionDocument = HydratedDocument<SolutionClass>


enum STATUSES {
  'not_checked',
  'checked',
  'declined'
}

@Schema()
export class SolutionClass {
  @Prop({
    type: String,
  })
  notes: string

  @Prop({
    type: String
  })
  links: string

  @Prop({
    type: String
  })
  date: string

  @Prop({
    type: String,
    enum: STATUSES,
    default: 'not_checked'
  })
  status: string

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  student: mongoose.Schema.Types.ObjectId

  @Prop({
    type: String,
  })
  studentName: string

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Homework',
  })
  homework: mongoose.Schema.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
  })
  course: mongoose.Schema.Types.ObjectId

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
  })
  lesson: mongoose.Schema.Types.ObjectId

  @Prop({
    type: String
  })
  folderPath: string

  @Prop({
    type: String
  })
  teacherComment: string

  @Prop({
    type: [String]
  })
  folderPaths: string[]

  @Prop({
    type: [String]
  })
  archives: string[]

  @Prop({
    type: [String]
  })
  anyFiles: string[]

  @Prop({
    type: [String]
  })
  code: string[]
}

export const SolutionSchema = SchemaFactory.createForClass(SolutionClass)
