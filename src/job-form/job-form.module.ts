import { Module } from '@nestjs/common';
import { JobFormService } from './job-form.service';
import { JobFormController } from './job-form.controller';
import JobFormModel from './models/job-form.model';
import JobReservationModel from './models/job-reservation.model';
import { MailService } from 'src/mail/mail.service';

@Module({
  controllers: [JobFormController],
  providers: [JobFormService, MailService],
  imports: [JobFormModel, JobReservationModel]
})
export class JobFormModule { }
