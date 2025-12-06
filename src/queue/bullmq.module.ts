import { Module, Global, forwardRef } from '@nestjs/common';
import { EmployeeBotModule } from 'src/employee-bot/employee-bot.module';
import { EmployeeMessageQueueProcessor } from 'src/employee-bot/employee-message-queue.processor';
import { Queue, Worker } from 'bullmq';

@Global()
@Module({
  imports: [
    forwardRef(() => EmployeeBotModule),
  ],
  providers: [
    EmployeeMessageQueueProcessor,
    {
      provide: 'MESSAGE_QUEUE',
      useFactory: () => new Queue('delayed-messages', {
        connection: {
          host: process.env.REDIS_HOST,
          port: Number(process.env.REDIS_PORT),
        },
      }),
    },
    {
      provide: 'MESSAGE_WORKER',
      inject: [EmployeeMessageQueueProcessor],
      useFactory: (processor: EmployeeMessageQueueProcessor) => {
        return new Worker(
          'delayed-messages',
          processor.process.bind(processor),
          {
            connection: {
              host: process.env.REDIS_HOST,
              port: Number(process.env.REDIS_PORT),
            },
          }
        );
      },
    },
  ],
  exports: ['MESSAGE_QUEUE'],
})
export class BullMQModule { }
