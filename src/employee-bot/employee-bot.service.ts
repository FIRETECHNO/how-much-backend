import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Telegraf } from 'telegraf';

@Injectable()
export class EmployeeBotService implements OnModuleInit {
  private bot: Telegraf;
  private readonly logger = new Logger(EmployeeBotService.name);

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
    const replyMarkup = { inline_keyboard: buttons };
    await this.sendMessage(telegramId, text, { reply_markup: replyMarkup, parse_mode: 'Markdown' });
  }
}