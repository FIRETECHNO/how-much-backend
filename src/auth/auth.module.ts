import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenModule } from 'src/token/token.module';

import { JwtModule } from '@nestjs/jwt';
import { RolesService } from 'src/roles/roles.service';
import { MailService } from 'src/mail/mail.service';

// mongodb
import UserModel from 'src/user/models/user.model';
import JobFormModel from 'src/job-form/models/job-form.model';

@Module({
  imports: [
    TokenModule,
    JwtModule,
    UserModel,
    JobFormModel
  ],
  controllers: [AuthController],
  providers: [AuthService, RolesService, MailService]
})
export class AuthModule { }
