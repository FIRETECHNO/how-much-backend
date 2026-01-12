import { Telegraf } from 'telegraf';

const employeeSender = new Telegraf(process.env.TG_EMPLOYEE_REGISTRATION_BOT_TOKEN);
const employerSender = new Telegraf(process.env.TG_EMPLOYER_REGISTRATION_BOT_TOKEN);

export async function sendEmployeeMessage(telegramId, text, options = {}) {
  try {
    await employeeSender.telegram.sendMessage(telegramId, text, options);
    console.log(`[Send] employee → ${telegramId}`);
  } catch (err) {
    console.error(`[Send Error] employee ${telegramId}:`, err);
    throw err;
  }
}

export async function sendEmployerMessage(telegramId, text, options = {}) {
  try {
    await employerSender.telegram.sendMessage(telegramId, text, options);
    console.log(`[Send] employer → ${telegramId}`);
  } catch (err) {
    console.error(`[Send Error] employer ${telegramId}:`, err);
    throw err;
  }
}