import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null,
});

export const messageQueue = new Queue('delayed-messages', { connection });

export function startMessageWorker() {
  const worker = new Worker(
    'delayed-messages',
    async (job) => {
      const { telegramId, text, options, botType } = job.data;

      console.log(`[Worker] Отправка отложенного сообщения в ${botType} → ${telegramId}`);

      const { sendEmployeeMessage, sendEmployerMessage } = await import('./senders.js');

      try {
        if (botType === 'employee') {
          await sendEmployeeMessage(telegramId, text, options);
        } else if (botType === 'employer') {
          await sendEmployerMessage(telegramId, text, options);
        } else {
          throw new Error(`Неизвестный тип бота: ${botType}`);
        }
      } catch (err) {
        console.error(`Ошибка отправки в ${botType}:`, err);
        throw err;
      }
    },
    { connection },
  );

  worker.on('completed', (job) => {
    console.log(`[Worker] Задача ${job.id} выполнена`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[Worker] Задача ${job.id} провалилась:`, err);
  });

  return worker;
}

export async function closeQueue() {
  await messageQueue.close();
}