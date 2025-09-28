import { Controller, Post, Body } from '@nestjs/common';
import { JobFormService } from './job-form.service';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JobFormClass } from './schemas/job-form.schema';
import { JobForm_client } from './interfaces/job-form.interface';
import { JobReservationClass } from './schemas/job-reservation.schema';
import ApiError from 'src/exceptions/errors/api-error';


const RESERVATION_DURATION = 6 * 60 * 60 * 1000

@Controller('job-form')
export class JobFormController {
  constructor(
    private readonly jobFormService: JobFormService,
    @InjectModel('JobForm') private JobFormModel: Model<JobFormClass>,
    @InjectModel('JobReservation') private JobReservationModel: Model<JobReservationClass>,
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
    const sixHoursAgo = new Date();
    sixHoursAgo.setHours(sixHoursAgo.getHours() - 6);

    let query = {
      $or: [
        {
          lastReservationDate: { $lt: sixHoursAgo }
        },
        { lastReservationDate: { $exists: false } },
      ]
    }
    return await this.JobFormModel.find(query)
  }

  @Post("reserve")
  async reserveJob(
    @Body("jobFormId") jobFormId: string,
    @Body("startDate") startDate: string,
    @Body("employerId") employerId: string,
  ) {


    let jobForm = await this.JobFormModel.findById(jobFormId)
    if (!jobForm) throw ApiError.NotFound(`Анкета не найдена`)

    // если у пользователя уже есть забронированная анкета
    let userReservations = await this.JobReservationModel.find({ employerId })
    for (let r of userReservations) {
      const currentTime = new Date().getTime()
      if (currentTime - r.startDate.getTime() <= RESERVATION_DURATION) {
        throw ApiError.AccessDenied("Вы ещё не можете зарезервировать этого кандидата, он занят")
      }
    }

    if (!jobForm.lastReservationDate) {
      jobForm.lastReservationDate = new Date(startDate)
      await jobForm.save();
      return await this.JobReservationModel.create({ jobFormId, startDate, employerId })
    }

    const currentTime = new Date().getTime()
    const timeDifference = currentTime - jobForm.lastReservationDate.getTime()

    if (timeDifference > RESERVATION_DURATION) {
      jobForm.lastReservationDate = new Date(startDate)
      await jobForm.save();
      return await this.JobReservationModel.create({ jobFormId, startDate, employerId })
    }

    throw ApiError.AccessDenied("Вы ещё не можете зарезервировать этого кандидата, он занят")
  }

  @Post("get-reserved")
  async getReservedJob(
    @Body("employerId") employerId: string
  ) {
    let userReservations = await this.JobReservationModel.find({ employerId })
    for (let r of userReservations) {
      const currentTime = new Date().getTime()
      if (currentTime - r.startDate.getTime() <= RESERVATION_DURATION) {
        return r
      }
    }

    return null;
  }
}
