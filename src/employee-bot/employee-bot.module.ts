import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { sessionMiddleware } from './session.middleware';
import { EmployeeBotUpdate } from './employee-bot.update';

const botToken = process.env.TG_EMPLOYEE_REGISTRATION_BOT_TOKEN;
if (!botToken) {
  throw new Error('TG_EMPLOYEE_REGISTRATION_BOT_TOKEN is not set');
}

@Module({
  imports: [
    TelegrafModule.forRoot({
      token: botToken,
      launchOptions: {
        dropPendingUpdates: true,
      },
      // Передаём middleware НАПРЯМУЮ как функцию
      middlewares: [sessionMiddleware()], // ← обратите внимание: вызываем и передаём результат
    }),
  ],
  providers: [EmployeeBotUpdate],
})
export class EmployeeBotModule { }