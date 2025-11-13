import { Module } from '@nestjs/common';
import { InvitesController } from './invites.controller';
import { InvitesService } from './invites.service';
import InviteModel from './models/invite.model';
import TokenModel from "../token/models/token.model"
import UserModel from 'src/user/models/user.model';
import { TokenService } from 'src/token/token.service';

@Module({
  imports: [
    InviteModel, TokenModel, UserModel
  ],
  controllers: [InvitesController],
  providers: [InvitesService, TokenService],
  exports: [InvitesService],
})
export class InvitesModule { }