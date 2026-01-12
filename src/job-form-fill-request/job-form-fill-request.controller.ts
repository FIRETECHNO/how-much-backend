import { Controller, Post, Body, Get } from '@nestjs/common';
import { JobFormFillRequestService } from './job-form-fill-request.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';


// all about MongoDB
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JobFormFillRequestClass } from './schemas/job-form-fill-request.schema';
import { JobFormFillRequest } from './interfaces/job-form-fill-request.interface';
import type { User } from "../user/interfaces/user.interface"
import { UserClass } from 'src/user/schemas/user.schema';


@Controller('job-form-fill-request')
export class JobFormFillRequestController {
  constructor(
    private readonly jobFormFillRequestService: JobFormFillRequestService,
    @InjectModel('JobFormFillRequest') private JobFormFillRequestModel: Model<JobFormFillRequestClass>,
    @InjectModel('User') private UserModel: Model<UserClass>,
    private readonly httpService: HttpService,
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

      await firstValueFrom(
        this.httpService.post(new URL('/api/send', process.env.TG_API_URL).toString(), {
          botType: 'employee',
          telegramId: tgId,
          text: message,
          options: {
            reply_markup: { inline_keyboard: buttons },
            parse_mode: 'Markdown'
          }
        }, {
          headers: { 'x-api-key': process.env.TG_API_KEY }
        })
      );
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
      await firstValueFrom(
        this.httpService.post(new URL('/api/send', process.env.TG_API_URL).toString(), {
          botType: 'employee',
          telegramId: tgId,
          text: message,
          options: {
            parse_mode: 'Markdown'
          }
        }, {
          headers: { 'x-api-key': process.env.TG_API_KEY }
        })
      );
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
        await firstValueFrom(
          this.httpService.post(new URL('/api/send', process.env.TG_API_URL).toString(), {
            botType: 'employee',
            telegramId: employeeTgId,
            text: `👋 Здравствуйте!

Ваша заявка на позицию *${updatedRequest.job}* принята.

С вами свяжется рекрутер: *${managerName}*.

Ожидайте личного сообщения в ближайшее время!`,
            options: {
              parse_mode: 'Markdown'
            }
          }, {
            headers: { 'x-api-key': process.env.TG_API_KEY }
          })
        );

        let startDateObj = new Date(updatedRequest.startDate)
        let startDate = startDateObj.getTime();
        let notificationDelta = 2 * 60 * 60 * 1000;


        const timeString = startDateObj.toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone: 'Europe/Moscow', // Moscow timezone
        });

        const reminderMsg = `👋 Собеседование в *${timeString} по МСК*\n` +
          `Ваш рекрутер: *${managerName}* ждет вас!`;

        let confirmUrl = new URL(`/employee/confirm-job-form-fill-request?_id=${jobRequestId}`, process.env.CLIENT_URL).toString()

        const buttons =
          [
            [
              {
                text: '📹 Подтвердить собеседование',
                url: confirmUrl,
              },
            ],
          ]
        await firstValueFrom(
          this.httpService.post(new URL('/api/schedule', process.env.TG_API_URL).toString(), {
            botType: 'employee',
            telegramId: employeeTgId,
            text: reminderMsg,
            // new Date(startDate - notificationDelta),
            timestamp: Date.now() + 20000,
            options: {
              parse_mode: 'Markdown',
              reply_markup: { inline_keyboard: buttons },
            }
          }, {
            headers: { 'x-api-key': process.env.TG_API_KEY }
          })
        );
      } catch (error) {
        console.error(`Не удалось отправить Telegram-уведомление сотруднику ${employeeTgId}:`, error.message);
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

  // @Get("possible-time-slots")
  // async getPossibleTimeSlots() {
  //   let adminEmails = process.env.ADMIN_EMAILS.split(",")

  //   let managers = await this.UserModel.find({ roles: "manager", email: { "$nin": adminEmails } })
  //   let managerIds = managers.map((m) => m._id.toString());

  //   console.log(managers);

  //   let allTakenSlots = await this.JobFormFillRequestModel.find({ startDate: { "$gte": Date.now() } })

  //   for (let slot of allTakenSlots) {
  //     let managersInUseForOneSlot = 0;
  //     for (let managerId of managerIds) {
  //       if (slot.manager.toString() == managerId) {
  //         managersInUseForOneSlot++;
  //       }
  //     }

  //   }

  //   return null;
  // }

  @Get("possible-time-slots")
  async getPossibleTimeSlots() {
    const adminEmails = process.env.ADMIN_EMAILS.split(",");

    // 1. Получаем всех менеджеров
    const managers = await this.UserModel.find({
      roles: "manager",
      email: { $nin: adminEmails }
    });

    const totalManagers = managers.length;

    // 2. Получаем все занятые слоты
    const allTakenSlots = await this.JobFormFillRequestModel.find({
      startDate: { "$gte": Date.now() }
    });

    // Группируем по startDate
    const slotsMap = new Map<string, typeof allTakenSlots>();

    for (const slot of allTakenSlots) {
      const key = slot.startDate.toString();

      if (!slotsMap.has(key)) {
        slotsMap.set(key, []);
      }

      slotsMap.get(key)!.push(slot);
    }

    // 3. Формируем ответ
    const result: { startDate: string; availableManagers: number }[] = [];

    for (const [dateKey, slots] of slotsMap.entries()) {
      let managersInUse = new Set();
      for (let s of slots) {
        if (s.manager != null) {
          managersInUse.add(s.manager);
        }
      }
      const available = totalManagers - managersInUse.size;

      result.push({
        startDate: slots[0].startDate.toISOString(),
        availableManagers: available
      });
    }

    return result;
  }

  @Post("get-by-id-for-confirmation")
  async getByIdForConfirmation(
    @Body("requestId") requestId: string,
  ) {
    return (await this.JobFormFillRequestModel.findById(requestId).exec())
      .populate("manager", { select: ["name"] })
  }

  @Post("employee-confirm")
  async employeeConfirm(
    @Body("requestId") requestId: string,
  ) {
    return await this.JobFormFillRequestModel
      .findOneAndUpdate({ _id: requestId, confirmedByEmployee: false },
        { confirmedByEmployee: true },
        { new: true })
  }
}
