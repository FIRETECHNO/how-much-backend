import { Types } from 'mongoose';

export enum InviteStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  EXPIRED = 'expired',
}

export interface Invite {
  email: string;
  token: string;
  status: InviteStatus;
  expiresAt: Date;
  role: string;
  acceptedBy: Types.ObjectId | null;
}

// Интерфейс для данных, приходящих от администратора
export interface CreateInvitePayload {
  email: string;
  role: string;
}