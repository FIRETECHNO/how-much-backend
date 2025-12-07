import { Controller, Post, Body } from '@nestjs/common';
import { JobFormService } from './job-form.service';
import { MailService } from 'src/mail/mail.service';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JobFormClass } from './schemas/job-form.schema';
import { JobForm_client } from './interfaces/job-form.interface';
import { JobReservationClass } from './schemas/job-reservation.schema';
import ApiError from 'src/exceptions/errors/api-error';

import { Types } from "mongoose"
import { EmployeeBotService } from 'src/employee-bot/employee-bot.service';
import { UserClass } from 'src/user/schemas/user.schema';


const RESERVATION_DURATION = 30 * 60 * 1000

@Controller('job-form')
export class JobFormController {
  constructor(
    private readonly employeeBotService: EmployeeBotService,
    private readonly jobFormService: JobFormService,
    private readonly mailService: MailService,
    @InjectModel('JobForm') private JobFormModel: Model<JobFormClass>,
    @InjectModel('JobReservation') private JobReservationModel: Model<JobReservationClass>,
    @InjectModel('User') private UserModel: Model<UserClass>,
  ) { }

  async sendJobFormNotification(tgId: number) {
    try {
      const btns = [
        [
          {
            text: '📹 Посмотреть отклик',
            url: new URL("employee/job-forms", process.env.CLIENT_URL),
          },
        ],
      ]
      await this.employeeBotService.sendMessageWithButtons(tgId, "*Работодатель забронировал вашу анкету!*\n\nОжидайте звонка или сообщения", btns)
    } catch (error) {
    }
  }
  @Post("create")
  async createJobForm(
    @Body("jobForm") jobForm: JobForm_client
  ) {
    let toSave = {
      job: jobForm?.job,
      fullName: jobForm?.fullName,
      coverLetter: jobForm?.coverLetter,
      video: jobForm?.video,
      phone: jobForm.phone,
      telegram: jobForm.telegram,
      email: jobForm.email,
      employeeId: null,
      salaryFrom: jobForm?.salaryFrom ?? null,
      salaryTo: jobForm?.salaryTo ?? null,
      experience: jobForm.experience,
      workFormat: jobForm.workFormat,
    }

    if (jobForm.employeeId != null) {
      toSave.employeeId = new Types.ObjectId(jobForm.employeeId)
    }

    let jobFormFromDb = await this.JobFormModel.create(toSave)

    if (jobForm?.employeeId == null) {
      await this.mailService.sendJobFormCreatedNotification(jobFormFromDb.email, jobFormFromDb.fullName)
    }
    return jobFormFromDb
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
  async getAll(
    @Body("selectedJob") selectedJob: string | null,
    @Body("selectedExperience") selectedExperience: string | null,
    @Body("selectedWorkFormat") selectedWorkFormat: string | null,
    @Body("salaryFrom") salaryFrom: number | null,
    @Body("salaryTo") salaryTo: number | null
  ) {
    const reservationDeadline = new Date();
    reservationDeadline.setMinutes(reservationDeadline.getMinutes() - 30);

    const raiseDeadline = new Date();
    raiseDeadline.setDate(raiseDeadline.getDate() - 2);

    let query: any = {
      $and: [
        { isApproved: true },
        {
          $or: [
            {
              lastReservationDate: { $lt: reservationDeadline }
            },
            { lastReservationDate: { $exists: false } },
          ],
        },
        {
          $or: [
            { lastRaiseDate: { $gt: raiseDeadline } },
            { lastRaiseDate: { $exists: false } },
          ],
        }
      ]
    }

    if (selectedJob) {
      query.$and.push({ job: selectedJob });
    }

    if (selectedExperience) {
      query.$and.push({ experience: selectedExperience });
    }

    if (selectedWorkFormat) {
      query.$and.push({ workFormat: selectedWorkFormat });
    }

    const salaryOverlapConditions = [];

    if (salaryFrom) {
      // Работодатель ищет от X. Нам подходят кандидаты, у которых:
      // - Верхняя граница (salaryTo) больше X
      // - ИЛИ верхняя граница не указана (значит, "до бесконечности")
      salaryOverlapConditions.push({
        $or: [
          { salaryTo: { $gte: salaryFrom } },
          { salaryTo: null }
        ]
      });
    }

    if (salaryTo) {
      // Работодатель ищет до Y. Нам подходят кандидаты, у которых:
      // - Нижняя граница (salaryFrom) меньше Y
      // - ИЛИ нижняя граница не указана (значит, "от 0")
      salaryOverlapConditions.push({
        $or: [
          { salaryFrom: { $lte: salaryTo } },
          { salaryFrom: null }
        ]
      });
    }

    // Если работодатель указал хотя бы одну границу зарплаты,
    // мы добавляем сложное условие в основной запрос.
    if (salaryOverlapConditions.length > 0) {
      query.$and.push({
        $or: [
          // 1. Включаем всех, кто ВООБЩЕ не указал зарплату (позитивный поиск)
          { salaryFrom: null, salaryTo: null },
          // 2. ИЛИ тех, чей диапазон пересекается с поиском
          { $and: salaryOverlapConditions }
        ]
      });
    }

    let res = await this.JobFormModel.find(query).sort({ lastRaiseDate: -1 })

    return res
  }

  @Post("reserve")
  async reserveJob(
    @Body("jobFormId") jobFormId: string,
    @Body("startDate") startDate: string,
    @Body("employerId") employerId: string,
    @Body("employeeId") employeeId: string,
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

    let employee = await this.UserModel.findById(employeeId)

    if (!jobForm.lastReservationDate) {
      jobForm.lastReservationDate = new Date(startDate)
      await jobForm.save();
      await this.sendJobFormNotification(employee.tgId)
      return (await this.JobReservationModel.create({ jobFormId, startDate, employerId, employeeId })).populate("jobFormId")
    }

    const currentTime = new Date().getTime()
    const timeDifference = currentTime - jobForm.lastReservationDate.getTime()


    if (timeDifference > RESERVATION_DURATION) {
      jobForm.lastReservationDate = new Date(startDate)
      await jobForm.save();
      await this.sendJobFormNotification(employee.tgId)
      return (await this.JobReservationModel.create({ jobFormId, startDate, employerId, employeeId })).populate("jobFormId")
    }

    throw ApiError.AccessDenied("Вы ещё не можете зарезервировать этого кандидата, он занят")
  }

  @Post("get-reserved")
  async getReservedJob(
    @Body("employerId") employerId: string
  ) {
    let userReservations = await this.JobReservationModel.find({ employerId }).populate("jobFormId")
    for (let r of userReservations) {
      const currentTime = new Date().getTime()
      if (currentTime - r.startDate.getTime() <= RESERVATION_DURATION) {
        return r
      }
    }

    return null;
  }

  @Post("get-by-employee-id")
  async getByEmployeeId(
    @Body("employeeId") employeeId: string
  ) {
    return await this.JobFormModel.find({ employeeId: new Types.ObjectId(employeeId) })
  }

  @Post("approve")
  async approveJobForm(
    @Body("jobFormId") jobFormId: string
  ) {
    let candidate = await this.JobFormModel.findById(jobFormId)
    if (!candidate) throw ApiError.NotFound("анкета не найдена")

    candidate.isApproved = true;
    candidate.markModified("isApproved")

    let currentDate = new Date().toISOString()
    candidate.lastRaiseDate = new Date(currentDate);
    candidate.markModified("lastRaiseDate")

    return await candidate.save();
  }
  @Post("disapprove")
  async disapproveJobForm(
    @Body("jobFormId") jobFormId: string
  ) {
    let candidate = await this.JobFormModel.findById(jobFormId)
    if (!candidate) throw ApiError.NotFound("анкета не найдена")

    candidate.isApproved = false;
    candidate.markModified("isApproved")

    return await candidate.save();
  }
  @Post("boost")
  async boostJobForm(
    @Body("jobFormId") jobFormId: string,
    @Body("raiseDate") raiseDate: string
  ) {
    let candidate = await this.JobFormModel.findById(jobFormId)
    if (!candidate) throw ApiError.NotFound("анкета не найдена")

    candidate.lastRaiseDate = new Date(raiseDate);
    candidate.markModified("lastRaiseDate")

    return await candidate.save();
  }

  @Post('job-reservation/by-employer')
  async getEmployerJobFormsHistory(
    @Body("employerId") employerId: string
  ) {
    return await this.JobReservationModel.find({
      employerId
    }).populate("jobFormId")
  }

  @Post('job-reservation/by-employee')
  async getEmployeeJobReservations(
    @Body("employeeId") employeeId: string
  ) {
    let weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    let query = {
      employeeId,
      startDate: { $gt: weekAgo }
    }
    return await this.JobReservationModel.find(query).populate("jobFormId").populate({
      path: "employerId",
      select: {
        company: 1,
        email: 1,
      }
    })
  }

  @Post("job-reservation/submit-feedback")
  async submitJobReservationFeedback(
    @Body("reservationId") reservationId: string,
    @Body("employerFeedback") employerFeedback: string | null,
    @Body("employeeFeedback") employeeFeedback: string | null,
  ) {
    if (!employerFeedback && !employeeFeedback) {
      throw ApiError.BadRequest("Неправильно передана обратная связь")
    }
    let currentDate = new Date()
    if (employerFeedback) {
      return await this.JobReservationModel.findByIdAndUpdate(reservationId, {
        $set: {
          employerFeedback: {
            textContent: employerFeedback,
            sentDate: currentDate.toISOString()
          }
        }
      }, { new: true }).populate("jobFormId").populate({
        path: "employerId",
        select: {
          company: 1,
          email: 1,
        }
      })
    }

    if (employeeFeedback) {
      return await this.JobReservationModel.findByIdAndUpdate(reservationId, {
        $set: {
          employeeFeedback: {
            textContent: employeeFeedback,
            sentDate: currentDate.toISOString()
          }
        }
      }, { new: true }).populate("jobFormId").populate({
        path: "employerId",
        select: {
          company: 1,
          email: 1,
        }
      })
    }
  }

  @Post("job-reservation/get-by-id")
  async getJobReservationById(
    @Body("reservationId") reservationId: string
  ) {
    return await this.JobReservationModel.findById(reservationId).populate("jobFormId").populate({
      path: "employerId",
      select: {
        company: 1,
        email: 1,
      }
    })
  }
}
