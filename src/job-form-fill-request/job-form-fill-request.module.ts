import { Module } from '@nestjs/common';
import { JobFormFillRequestService } from './job-form-fill-request.service';
import { JobFormFillRequestController } from './job-form-fill-request.controller';
import JobFormFillRequestModel from './models/job-form-fill-request.model';
import UserModel from 'src/user/models/user.model';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [JobFormFillRequestModel, UserModel, HttpModule],
  controllers: [JobFormFillRequestController],
  providers: [JobFormFillRequestService],
})
export class JobFormFillRequestModule { }
