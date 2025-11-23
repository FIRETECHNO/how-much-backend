import { Injectable, Logger } from '@nestjs/common';
import { Update, Start, On } from 'nestjs-telegraf';
import { Context as TelegrafContext } from 'telegraf';
import { Markup } from 'telegraf';
import type { RegistrationSession } from './interfaces/session.interface';
import { Message } from 'telegraf/typings/core/types/typegram';

interface SessionContext extends TelegrafContext {
  session: RegistrationSession;
}

function isTextMessage(message: Message): message is Message.TextMessage {
  return 'text' in message;
}

@Update()
@Injectable()
export class EmployeeBotUpdate {
  private readonly logger = new Logger(EmployeeBotUpdate.name);
  private readonly VACANCIES: string[] = [
    'Продажи',
    'Маркетинг',
    'Ассистент',
    'Другое'
  ];
  private readonly BASE_URL = new URL('registration/employee', process.env.CLIENT_URL).toString();

  @Start()
  async onStart(ctx: SessionContext) {
    const tgId = ctx.from?.id;
    if (!tgId) {
      await ctx.reply('Не удалось определить ваш Telegram ID. Попробуйте начать снова.');
      return;
    }

    // Сохраняем username (может быть undefined → приводим к null)
    const tgUsername = ctx.from.username || null;

    Object.assign(ctx.session, {
      step: 'name',
      tgId,
      tgUsername, // ← добавлено
      name: undefined,
      vacancy: undefined,
      email: undefined,
    });

    await ctx.reply('👋 Добро пожаловать! Давайте начнём регистрацию.\n\nКак вас зовут?');
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

    // Обновляем tgId и tgUsername при каждом сообщении (на случай, если изменились)
    if (!ctx.session.tgId) {
      ctx.session.tgId = tgId;
    }
    if (ctx.session.tgUsername === undefined) {
      ctx.session.tgUsername = ctx.from.username || null;
    }

    const text = ctx.message.text.trim();

    if (!ctx.session.step) {
      ctx.session.step = 'name';
    }

    const { step } = ctx.session;

    if (step === 'name') {
      if (text.length < 2) {
        await ctx.reply('Имя должно быть не короче 2 символов. Попробуйте снова:');
        return;
      }
      ctx.session.name = text;
      ctx.session.step = 'vacancy';

      await ctx.reply('На какую вакансию вы хотите устроиться?', Markup.keyboard([
        [this.VACANCIES[0], this.VACANCIES[1]],
        [this.VACANCIES[2], this.VACANCIES[3]],
      ]).oneTime().resize());

    } else if (step === 'vacancy') {
      const normalizedText = text.trim();
      if (!this.VACANCIES.includes(normalizedText)) {
        await ctx.reply('Пожалуйста, выберите вакансию из кнопок ниже:', Markup.keyboard([
          [this.VACANCIES[0], this.VACANCIES[1]],
          [this.VACANCIES[2], this.VACANCIES[3]],
        ]).oneTime().resize());
        return;
      }

      ctx.session.vacancy = normalizedText;
      ctx.session.step = 'email';
      await ctx.reply('Теперь введите ваш email:', Markup.removeKeyboard());

    } else if (step === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(text)) {
        await ctx.reply('Некорректный email. Попробуйте снова:');
        return;
      }

      ctx.session.email = text;

      const params = new URLSearchParams({
        name: ctx.session.name!,
        vacancy: ctx.session.vacancy!,
        email: ctx.session.email,
        tgId: String(ctx.session.tgId),
        ...(ctx.session.tgUsername && { tgUsername: ctx.session.tgUsername }),
      });

      const link = `${this.BASE_URL}?${params.toString()}`;

      await ctx.reply(
        `✅ Регистрация почти завершена!\n\nПерейдите по ссылке, чтобы завершить:\n${link}`,
        {
          link_preview_options: { is_disabled: true },
        }
      );

      // Сброс сессии через мутацию
      Object.assign(ctx.session, {
        step: 'name',
        tgId: ctx.session.tgId, // можно сохранить, если нужно для будущих сессий
        name: undefined,
        vacancy: undefined,
        email: undefined,
      });
    }
  }
}