import { Injectable, OnModuleInit, Logger, Inject } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import { Queue } from 'bullmq';

@Injectable()
export class EmployeeBotService implements OnModuleInit {
  private bot: Telegraf;
  private readonly logger = new Logger(EmployeeBotService.name);

  constructor(
    @Inject('MESSAGE_QUEUE')
    private readonly queue: Queue,
  ) { }


  onModuleInit() {
    const token = process.env.TG_EMPLOYEE_REGISTRATION_BOT_TOKEN;
    if (!token) {
      this.logger.error('TG_EMPLOYEE_REGISTRATION_BOT_TOKEN не задан в .env');
      throw new Error('Токен Telegram-бота обязателен');
    }

    // Создаём бота ТОЛЬКО для отправки сообщений
    this.bot = new Telegraf(token);
    this.logger.log('EmployeeBotService инициализирован (режим отправки)');
  }

  /**
   * Отправить текстовое сообщение пользователю по его Telegram ID
   */
  async sendMessage(telegramId: number, text: string, options: any = {}): Promise<void> {
    try {
      await this.bot.telegram.sendMessage(telegramId, text, options);
      this.logger.debug(`Сообщение отправлено пользователю ${telegramId}`);
    } catch (error) {
      this.logger.error(
        `Ошибка отправки сообщения пользователю ${telegramId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async sendMessageWithButtons(
    telegramId: number,
    text: string,
    buttons: any[][],
  ): Promise<void> {
    try {
      const replyMarkup = { inline_keyboard: buttons };
      await this.sendMessage(telegramId, text, { reply_markup: replyMarkup, parse_mode: 'Markdown' });
    } catch (error) {

    }
  }

  async scheduleMessageAt(
    telegramId: number,
    text: string,
    date: Date | number,
    options: any = {},
  ) {
    const targetTs = date instanceof Date ? date.getTime() : date;
    const now = Date.now();

    const delayMs = targetTs - now;

    if (delayMs <= 0) {
      this.logger.warn(
        `Время ${new Date(targetTs).toISOString()} уже прошло — сообщение отправляется сразу`,
      );
      return this.sendMessage(telegramId, text, options);
    }

    await this.queue.add(
      'send-delayed-message',
      { telegramId, text, options },
      { delay: delayMs },
    );

    this.logger.log(
      `Сообщение запланировано на ${new Date(targetTs).toISOString()} (через ${delayMs} мс)`,
    );
  }
}