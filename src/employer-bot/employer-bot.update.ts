import { Injectable, Logger } from '@nestjs/common';
import { Update, Start, On } from 'nestjs-telegraf';
import { Context as TelegrafContext } from 'telegraf';
import { Message } from 'telegraf/typings/core/types/typegram';
import type { RegistrationSession } from './interfaces/session.interface';

interface SessionContext extends TelegrafContext {
  session: RegistrationSession;
}

function isTextMessage(message: Message): message is Message.TextMessage {
  return 'text' in message;
}

@Update()
@Injectable()
export class EmployerBotUpdate {
  private readonly logger = new Logger(EmployerBotUpdate.name);
  private readonly BASE_URL = new URL('registration/employer', process.env.CLIENT_URL).toString();

  @Start()
  async onStart(ctx: SessionContext) {
    const tgId = ctx.from?.id;
    if (!tgId) {
      await ctx.reply('Не удалось определить ваш Telegram ID. Попробуйте начать снова.');
      return;
    }

    const tgUsername = ctx.from.username || null;

    Object.assign(ctx.session, {
      step: 'name',
      tgId,
      tgUsername,
      name: undefined,
      inn: undefined,      // по ИНН получим companyName из dadata
      email: undefined,
    });

    await ctx.reply('👋 Добро пожаловать! Давайте зарегистрируем вас как работодателя.\n\nКак вас зовут?');
  }

  @On('text')
  async onText(ctx: SessionContext) {
    if (!ctx.message || !isTextMessage(ctx.message)) {
      return;
    }

    const tgId = ctx.from?.id;
    if (!tgId) {
      await ctx.reply('Ошибка: неизвестный Telegram ID.');
      return;
    }

    if (!ctx.session.tgId) ctx.session.tgId = tgId;
    if (ctx.session.tgUsername === undefined) {
      ctx.session.tgUsername = ctx.from.username || null;
    }

    const text = ctx.message.text.trim();

    if (!ctx.session.step) {
      ctx.session.step = 'name';
    }

    const { step } = ctx.session;

    // ШАГ 1: Имя (ФИО контактного лица)
    if (step === 'name') {
      if (text.length < 2) {
        await ctx.reply('Имя должно быть не короче 2 символов. Попробуйте снова:');
        return;
      }
      ctx.session.name = text; // ← сохраняем ФИО
      ctx.session.step = 'inn';
      await ctx.reply('Укажите ИНН вашей компании (10 или 12 цифр):');

      // ШАГ 2: ИНН
    } else if (step === 'inn') {
      const innRegex = /^\d{10,12}$/;
      if (!innRegex.test(text)) {
        await ctx.reply('ИНН должен содержать 10 или 12 цифр. Попробуйте снова:');
        return;
      }
      ctx.session.inn = text;
      ctx.session.step = 'email';
      await ctx.reply('Теперь укажите рабочий email компании:');

      // ШАГ 3: Email
    } else if (step === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(text)) {
        await ctx.reply('Некорректный email. Попробуйте снова:');
        return;
      }

      ctx.session.email = text;

      const params = new URLSearchParams({
        name: ctx.session.name!,
        inn: ctx.session.inn!,
        email: ctx.session.email,
        tgId: String(ctx.session.tgId),
        ...(ctx.session.tgUsername && { tgUsername: ctx.session.tgUsername }),
      });

      const link = `${this.BASE_URL}?${params.toString()}`;

      await ctx.reply(
        `✅ Регистрация почти завершена!\n\nНажмите кнопку ниже, чтобы завершить 👇`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: '✅ Завершить регистрацию', url: link }],
            ],
          },
          link_preview_options: { is_disabled: true },
        }
      );

      // Сброс сессии
      Object.assign(ctx.session, {
        step: 'name',
        tgId: ctx.session.tgId,
        tgUsername: ctx.session.tgUsername,
        name: undefined,
        inn: undefined,
        email: undefined,
      });
    }
  }
}