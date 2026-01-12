import { Telegraf } from 'telegraf';

export const employeeBot = new Telegraf(process.env.TG_EMPLOYEE_REGISTRATION_BOT_TOKEN);
export const employeeHelpBot = new Telegraf(process.env.TG_EMPLOYEE_HELP_BOT_TOKEN);
export const employerBot = new Telegraf(process.env.TG_EMPLOYER_REGISTRATION_BOT_TOKEN);