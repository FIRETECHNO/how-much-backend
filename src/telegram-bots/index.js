import 'dotenv/config';

import { employeeBot as employee, employerBot as employer, employeeHelpBot as employeeHelp } from './bots/index.js';
import { createSession } from './session.js';
import { startMessageWorker, closeQueue } from './queue.js';
import employeeBotLogic from './bots/employee-bot.js';
import employeeHelpBotLogic from './bots/employee-help-bot.js';
import employerBotLogic from './bots/employer-bot.js';
import express from 'express';
import apiRouter from './api/router.js';

async function startBots() {
  console.log('🚀 Запуск Telegram-ботов + очередей...');

  const worker = startMessageWorker();

  employee.use(createSession('employee'));
  employee.use(employeeBotLogic);
  employee.launch({ dropPendingUpdates: true });
  console.log('👷 Employee Bot запущен');

  employeeHelp.use(createSession('employee-help'));
  employeeHelp.use(employeeHelpBotLogic);
  employeeHelp.launch({ dropPendingUpdates: true });
  console.log('🆘 EmployeeHelp Bot запущен');

  employer.use(createSession('employer'));
  employer.use(employerBotLogic);
  employer.launch({ dropPendingUpdates: true });
  console.log('👔 Employer Bot запущен');

  // Запускаем API-сервер
  const app = express();
  app.use(express.json());
  app.use('/api', apiRouter); // все эндпоинты под /api

  const PORT = process.env.TG_API_PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Telegram API сервер на http://localhost:${PORT}`);
  });

  console.log('Готово! Всё запущено.');

  const shutdown = async () => {
    console.log('Остановка...');
    employee.stop('SIGINT');
    employer.stop('SIGINT');
    worker.close();
    await closeQueue();
    process.exit(0);
  };

  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}

startBots().catch((err) => {
  console.error('Ошибка запуска:', err);
  process.exit(1);
});