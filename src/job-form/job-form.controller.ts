import { Controller, Post, Body } from '@nestjs/common';
import { JobFormService } from './job-form.service';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JobFormClass } from './schemas/job-form.schema';
import { JobForm_client } from './interfaces/job-form.interface';

@Controller('job-form')
export class JobFormController {
  constructor(
    private readonly jobFormService: JobFormService,
    @InjectModel('JobForm') private JobFormModel: Model<JobFormClass>,
  ) { }

  @Post("create")
  async createJobForm(
    @Body("jobForm") jobForm: JobForm_client
  ) {
    let toSave = {
      job: jobForm?.job,
      fullName: jobForm?.fullName,
      coverLetter: jobForm?.coverLetter,
      video: jobForm?.video
    }

    return await this.JobFormModel.create(toSave)
  }

  @Post('admin/get-all')
  async getOrganizationJobs() {
    return await this.JobFormModel.find({})
  }

  @Post('get-by-id')
  async getById(
    @Body("jobId") jobId: string
  ) {
    return await this.JobFormModel.findById(jobId)
  }

  @Post("get-all")
  async getAll() {
    return await this.JobFormModel.find({})
  }
}
