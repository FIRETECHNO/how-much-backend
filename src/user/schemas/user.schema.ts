import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { CompanyFromDadataClass, CompanyFromDadataSchema } from './company.schema';

export type UserDocument = HydratedDocument<UserClass>;

@Schema()
export class UserClass {
  @Prop({
    type: String,
    required: true,
    min: 2,
  })
  name: string;

  @Prop({
    type: String,
    required: true,
    unique: true
  })
  email: string;

  @Prop({
    type: String,
    required: true,
  })
  password: string;

  @Prop({
    type: Array,
    default: [],
    required: false,
  })
  roles: string[];

  @Prop({
    type: Array,
    default: [],
    required: false
  })
  avatars: string[];

  @Prop({
    type: CompanyFromDadataSchema,
    required: false,
    default: null,
  })
  company: CompanyFromDadataClass | null;

  @Prop({
    type: Boolean,
    required: false,
    default: false
  })
  isModerated: boolean
}

export const UserSchema = SchemaFactory.createForClass(UserClass);