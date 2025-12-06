import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { EmployeeBotService } from './employee-bot.service';

@Processor('delayed-messages')
@Injectable()
export class EmployeeMessageQueueProcessor extends WorkerHost {
  private readonly logger = new Logger(EmployeeMessageQueueProcessor.name);

  constructor(private readonly botService: EmployeeBotService) {
    super();
  }

  /**
   * Обрабатывает задачи очереди
   */
  async process(job: Job<any>): Promise<any> {
    const { telegramId, text, options } = job.data;

    this.logger.log(`Исполнение задачи ${job.id}: отправка сообщения`);

    try {
      await this.botService.sendMessage(telegramId, text, options);
      this.logger.debug(`Отложенное сообщение отправлено пользователю ${telegramId}`);
    } catch (err) {
      this.logger.error('Ошибка при обработке отложенного сообщения', err.stack);
    }
  }
}
