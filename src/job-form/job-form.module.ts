import { Module } from '@nestjs/common';
import { JobFormService } from './job-form.service';
import { JobFormController } from './job-form.controller';
import JobFormModel from './models/job-form.model';
import JobReservationModel from './models/job-reservation.model';
import { MailService } from 'src/mail/mail.service';
import { EmployeeBotService } from 'src/employee-bot/employee-bot.service';
import UserModel from 'src/user/models/user.model';

@Module({
  controllers: [JobFormController],
  providers: [JobFormService, MailService, EmployeeBotService],
  imports: [JobFormModel, JobReservationModel, UserModel]
})
export class JobFormModule { }
