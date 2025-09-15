import { Module } from '@nestjs/common';
import { JobFormService } from './job-form.service';
import { JobFormController } from './job-form.controller';
import UserModel from './models/job-form.model';

@Module({
  controllers: [JobFormController],
  providers: [JobFormService],
  imports: [UserModel]
})
export class JobFormModule { }
