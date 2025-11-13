import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Invite as IInvite, InviteStatus } from '../interfaces/invite.interface';

export type InviteDocument = HydratedDocument<Invite>;

@Schema({ timestamps: true })
export class Invite implements IInvite {
  @Prop({ type: String, required: true, unique: true, index: true })
  email: string;

  @Prop({ type: String, required: true, unique: true, index: true })
  token: string;

  @Prop({ type: String, enum: InviteStatus, default: InviteStatus.PENDING })
  status: InviteStatus;

  @Prop({ type: Date, required: true })
  expiresAt: Date;

  @Prop({ type: String, required: true, default: 'manager' })
  role: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null })
  acceptedBy: Types.ObjectId | null;
}

export const InviteSchema = SchemaFactory.createForClass(Invite);