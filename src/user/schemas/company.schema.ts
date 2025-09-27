
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
class CompanyName {
  @Prop({ type: String, required: true })
  full_with_opf: string;

  @Prop({ type: String, required: true })
  short_with_opf: string;

  @Prop({ type: String, required: true })
  full: string;
}
const CompanyNameSchema = SchemaFactory.createForClass(CompanyName);

@Schema({ _id: false })
class CompanyAddress {
  @Prop({ type: String, required: true })
  value: string;
}
const CompanyAddressSchema = SchemaFactory.createForClass(CompanyAddress);

@Schema({ _id: false })
class CompanyDataClass {
  @Prop({ type: CompanyNameSchema, required: true })
  name: CompanyName;

  @Prop({
    type: String,
    required: true,
    sparse: true
  })
  inn: string;

  @Prop({ type: String, required: true })
  ogrn: string;

  @Prop({ type: String, required: true })
  okved: string;

  @Prop({ type: String, required: false, default: null })
  kpp: string | null;

  @Prop({ type: CompanyAddressSchema, required: true })
  address: CompanyAddress;
}

const CompanyDataSchema = SchemaFactory.createForClass(CompanyDataClass);

@Schema({ _id: false })
export class CompanyFromDadataClass {
  @Prop({ type: CompanyDataSchema, required: true })
  data: CompanyDataClass;

  @Prop({ type: String, required: true })
  value: string;
}

export const CompanyFromDadataSchema = SchemaFactory.createForClass(CompanyFromDadataClass);