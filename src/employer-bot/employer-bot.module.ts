import { Module, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import { EmployerBotUpdate } from './employer-bot.update';
import { sessionMiddleware } from './session.middleware';
import { EmployerBotService } from './employer-bot.service';

const botToken = process.env.TG_EMPLOYER_REGISTRATION_BOT_TOKEN;
if (!botToken) {
  throw new Error('TG_EMPLOYER_REGISTRATION_BOT_TOKEN is not set');
}

@Module({
  providers: [EmployerBotService, EmployerBotUpdate],
  exports: [EmployerBotService],
})
export class EmployerBotModule implements OnModuleInit, OnModuleDestroy {
  private bot: Telegraf;

  constructor(private readonly update: EmployerBotUpdate) { }

  async onModuleInit() {
    this.bot = new Telegraf(botToken);

    this.bot.use(sessionMiddleware());
    this.bot.start((ctx) => this.update.onStart(ctx as any));
    this.bot.on('text', (ctx) => this.update.onText(ctx as any));

    // НЕ ждём launch, чтобы не блокировать event loop
    this.bot.launch({ dropPendingUpdates: true }).then(() => {
      console.log(
        `[EmployerBot] Started (token ends with ...${botToken.slice(-4)})`
      );
    });
  }

  async onModuleDestroy() {
    await this.bot.stop('SIGTERM');
  }
}
