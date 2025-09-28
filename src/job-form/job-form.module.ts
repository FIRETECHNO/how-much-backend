import { Module } from '@nestjs/common';
import { JobFormService } from './job-form.service';
import { JobFormController } from './job-form.controller';
import JobFormModel from './models/job-form.model';
import JobReservationModel from './models/job-reservation.model';

@Module({
  controllers: [JobFormController],
  providers: [JobFormService],
  imports: [JobFormModel, JobReservationModel]
})
export class JobFormModule { }
