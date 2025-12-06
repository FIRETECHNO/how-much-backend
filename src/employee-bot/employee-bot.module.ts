import { Module, forwardRef } from '@nestjs/common';
import { BullMQModule } from 'src/queue/bullmq.module';
import { EmployeeBotService } from './employee-bot.service';
import { EmployeeBotUpdate } from './employee-bot.update';
import { TelegrafModule } from 'nestjs-telegraf';
import { sessionMiddleware } from './session.middleware';

const botToken = process.env.TG_EMPLOYEE_REGISTRATION_BOT_TOKEN;
if (!botToken) throw new Error('TG_EMPLOYEE_REGISTRATION_BOT_TOKEN is not set');

@Module({
  imports: [
    TelegrafModule.forRoot({
      token: botToken,
      launchOptions: { dropPendingUpdates: true },
      middlewares: [sessionMiddleware()],
    }),
    forwardRef(() => BullMQModule),
  ],
  providers: [EmployeeBotService, EmployeeBotUpdate],
  exports: [EmployeeBotService],
})
export class EmployeeBotModule { }
