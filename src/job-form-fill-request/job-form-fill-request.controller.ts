import { Controller, Post, Body } from '@nestjs/common';
import { JobFormFillRequestService } from './job-form-fill-request.service';

// all about MongoDB
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JobFormFillRequestClass } from './schemas/job-form-fill-request.schema';
import { JobFormFillRequest } from './interfaces/job-form-fill-request.interface';


@Controller('job-form-fill-request')
export class JobFormFillRequestController {
  constructor(private readonly jobFormFillRequestService: JobFormFillRequestService,
    @InjectModel('JobFormFillRequest') private JobFormFillRequestModel: Model<JobFormFillRequestClass>,
  ) { }

  @Post("create-short")
  async createShort(
    @Body("employeeId") employeeId: string,
    @Body("job") job: string,
  ) {
    return await this.JobFormFillRequestModel.create({
      employee: employeeId,
      job
    })
  }
  @Post("create")
  async create(
    @Body() jobFormFillRequest: JobFormFillRequest,
  ) {
    return await this.JobFormFillRequestModel.create(jobFormFillRequest)
  }


  @Post("update")
  async update(
    @Body("requestId") requestId: string,
    @Body("request") jobFormFillRequest: JobFormFillRequest,
  ) {
    return await this.JobFormFillRequestModel.findByIdAndUpdate(requestId,
      { $set: { startDate: jobFormFillRequest.startDate, endDate: jobFormFillRequest.endDate } },
      { new: true }
    )
  }

  @Post("get-by-id")
  async getById(
    @Body("requestId") requestId: string,
  ) {
    return await this.JobFormFillRequestModel.findById(requestId)
  }

  @Post("get-by-employee")
  async getByEmployee(
    @Body("employeeId") employeeId: string,
  ) {
    return await this.JobFormFillRequestModel.find({
      employee: employeeId,
    })
  }
}
