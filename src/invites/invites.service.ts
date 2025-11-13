import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Invite, InviteDocument } from './schemas/invite.schema';
import { InviteStatus } from './interfaces/invite.interface';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import ApiError from 'src/exceptions/errors/api-error';

@Injectable()
export class InvitesService {
  constructor(
    @InjectModel(Invite.name) private inviteModel: Model<InviteDocument>,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) { }

  async create(email: string, role: string): Promise<Invite> {
    const existingInvite = await this.inviteModel.findOne({ email, status: InviteStatus.PENDING });
    if (existingInvite) {
      throw ApiError.BadRequest("Активное приглашение для этого email уже существует.")
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const newInvite = new this.inviteModel({ email, token, expiresAt, role });

    // const registrationUrl = `${this.configService.get('FRONTEND_URL')}/registration/manager?invite_token=${token}`;

    // await this.mailerService.sendMail({
    //   to: email,
    //   subject: 'Приглашение для регистрации',
    //   template: './invitation',
    //   context: { url: registrationUrl },
    // });

    return newInvite.save();
  }

  async getInvites(): Promise<Invite[]> {
    return this.inviteModel.find({})
  }

  async validate(token: string): Promise<Invite> {
    const invite = await this.inviteModel.findOne({ token });

    if (!invite || invite.status !== InviteStatus.PENDING) {
      throw ApiError.NotFound('Приглашение не найдено или уже было использовано.');
    }

    if (invite.expiresAt < new Date()) {
      invite.status = InviteStatus.EXPIRED;
      await invite.save();
      throw ApiError.BadRequest('Срок действия приглашения истек.');
    }

    return invite;
  }

  async consume(token: string, userId: Types.ObjectId): Promise<void> {
    await this.inviteModel.updateOne(
      { token },
      { $set: { status: InviteStatus.ACCEPTED, acceptedBy: userId } },
    );
  }
}