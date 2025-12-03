import { Module } from '@nestjs/common';
import { JobFormFillRequestService } from './job-form-fill-request.service';
import { JobFormFillRequestController } from './job-form-fill-request.controller';
import JobFormFillRequestModel from './models/job-form-fill-request.model';
import { EmployeeBotService } from 'src/employee-bot/employee-bot.service';
import UserModel from 'src/user/models/user.model';

@Module({
  imports: [JobFormFillRequestModel, UserModel],
  controllers: [JobFormFillRequestController],
  providers: [JobFormFillRequestService, EmployeeBotService],
})
export class JobFormFillRequestModule { }
