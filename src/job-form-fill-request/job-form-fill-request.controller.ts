import { Controller, Post, Body } from '@nestjs/common';
import { JobFormFillRequestService } from './job-form-fill-request.service';

// all about MongoDB
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JobFormFillRequestClass } from './schemas/job-form-fill-request.schema';
import { JobFormFillRequest } from './interfaces/job-form-fill-request.interface';
import { EmployeeBotService } from 'src/employee-bot/employee-bot.service';
import type { User } from "../user/interfaces/user.interface"


@Controller('job-form-fill-request')
export class JobFormFillRequestController {
  constructor(
    private readonly jobFormFillRequestService: JobFormFillRequestService,
    private readonly employeeBotService: EmployeeBotService,
    @InjectModel('JobFormFillRequest') private JobFormFillRequestModel: Model<JobFormFillRequestClass>,
  ) { }

  // Вызывается при регистрации employee, когда он пришел по ссылке вида:
  // http://localhost:3011/registration/employee?name=%D0%BF%D0%BE%D0%BF%D0%B8&vacancy=%D0%9F%D1%80%D0%BE%D0%B4%D0%B0%D0%B6%D0%B8&email=popi%40gmail.com&tgId=1155714398
  @Post("create-short")
  async createShort(
    @Body("employeeId") employeeId: string,
    @Body("job") job: string,
    @Body("tgId") tgId: number | null
  ) {
    let jobFormFillRequest = await this.JobFormFillRequestModel.create({
      employee: employeeId,
      job
    })

    if (tgId) {
      const interviewUrl = new URL(`/employee/send-job-form-fill-request?request_id=${jobFormFillRequest._id}`, process.env.CLIENT_URL).toString()

      const message = `🎉 Спасибо за регистрацию!

Вы выбрали позицию: *${job}* — отличный выбор! 🙌

Теперь приглашаем вас назначить удобное время для короткого видео-интервью.  
Это займёт всего 15–20 минут и поможет нам лучше узнать вас.

Нажмите кнопку ниже, чтобы выбрать слот 👇`;

      const buttons = [
        [
          {
            text: '📹 Выбрать время для интервью',
            url: interviewUrl,
          },
        ],
      ];

      await this.employeeBotService.sendMessageWithButtons(tgId, message, buttons);
    }

    return jobFormFillRequest
  }
  @Post("create")
  async create(
    @Body("request") jobFormFillRequest: JobFormFillRequest,
  ) {
    return await this.JobFormFillRequestModel.create(jobFormFillRequest)
  }


  @Post("update")
  async update(
    @Body("requestId") requestId: string,
    @Body("tgId") tgId: number | null,
    @Body("request") jobFormFillRequest: JobFormFillRequest,
  ) {
    let updateResult = await this.JobFormFillRequestModel.findByIdAndUpdate(requestId,
      { $set: { startDate: jobFormFillRequest.startDate, endDate: jobFormFillRequest.endDate } },
      { new: true }
    )

    if (tgId) {
      const message = `✅ Поздравляем! Вы успешно завершили заявку на видео-интервью *${jobFormFillRequest.job}*.

Мы получили ваше расписание и скоро свяжемся с вами для подтверждения.

Спасибо, что вы с нами! 🙏`
      await this.employeeBotService.sendMessage(tgId, message, { parse_mode: 'Markdown' });
    }

    return updateResult
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

  @Post("get-all")
  async getAllRequests() {
    return await this.JobFormFillRequestModel
      .find({ startDate: { $gte: Date.now() }, manager: null })
      .sort({ startDate: 1 }) // 1 — по возрастанию, -1 — по убыванию
      .populate({ path: "employee", select: ['email', "name", "tgUsername", "tgId"] })
  }

  // @Post("set-manager")
  // async setManager(
  //   @Body("manager") manager: string,
  //   @Body("managerName") managerName: string,
  //   @Body("jobRequestId") jobRequestId: string,
  //   @Body("employeeTgId") employeeTgId: User["tgId"],

  // ) {
  //   // jobRequestId,
  //   //     employeeTgId,
  //   //     manager,
  //   //     managerName

  //   return await this.JobFormFillRequestModel.findByIdAndUpdate(jobRequestId, { $set: { manager } })
  // }

  @Post("set-manager")
  async setManager(
    @Body("manager") manager: string,
    @Body("managerName") managerName: string,
    @Body("jobRequestId") jobRequestId: string,
    @Body("employeeTgId") employeeTgId: number, // ← number, а не User["tgId"]
  ) {
    // Обновляем заявку
    const updatedRequest = await this.JobFormFillRequestModel.findByIdAndUpdate(
      jobRequestId,
      { $set: { manager } },
      { new: true }
    );

    // Отправляем уведомление в Telegram
    if (employeeTgId) {
      try {
        await this.employeeBotService.sendMessage(
          employeeTgId,
          `👋 Здравствуйте!

Ваша заявка на позицию *${updatedRequest.job}* принята.

С вами свяжется рекрутер: *${managerName}*.

Ожидайте личного сообщения в ближайшее время!`,
          { parse_mode: 'Markdown' }
        );
      } catch (error) {
        console.error(`Не удалось отправить Telegram-уведомление сотруднику ${employeeTgId}:`, error.message);
        // Логируем, но не прерываем выполнение
      }
    }

    return updatedRequest;
  }

  @Post("get-by-manager")
  async getByManager(
    @Body("manager") manager: string
  ) {
    return await this.JobFormFillRequestModel.find({ manager, startDate: { $gte: Date.now() }, })
      .sort({ startDate: 1 }) // 1 — по возрастанию, -1 — по убыванию
      .populate({ path: "employee", select: ['email', "name", "tgUsername", "tgId"] })
  }
}
