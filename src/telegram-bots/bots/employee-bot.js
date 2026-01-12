import { Composer, Markup } from 'telegraf';

const composer = new Composer();

const VACANCIES = ['Продажи', 'Маркетинг', 'Ассистент', 'Другое'];

const BASE_URL = new URL('registration/employee', process.env.CLIENT_URL).toString();

composer.start(async (ctx) => {
  const tgId = ctx.from?.id;
  if (!tgId) {
    return ctx.reply('Не удалось определить ваш Telegram ID.');
  }

  ctx.session = {
    step: 'name',
    tgId,
    tgUsername: ctx.from.username || null,
    name: undefined,
    vacancy: undefined,
    email: undefined,
  };

  await ctx.reply('👋 Добро пожаловать! Давайте начнём регистрацию.\n\nКак вас зовут?');
});

composer.on('text', async (ctx) => {
  const text = ctx.message.text.trim();
  const session = ctx.session || {};

  if (!session.step) session.step = 'name';

  if (session.step === 'name') {
    if (text.length < 2) {
      return ctx.reply('Имя должно быть не короче 2 символов. Попробуйте снова:');
    }
    session.name = text;
    session.step = 'vacancy';

    return ctx.reply(
      'На какую вакансию вы хотите устроиться?',
      Markup.keyboard([
        [VACANCIES[0], VACANCIES[1]],
        [VACANCIES[2], VACANCIES[3]],
      ]).oneTime().resize(),
    );
  }

  if (session.step === 'vacancy') {
    if (!VACANCIES.includes(text)) {
      return ctx.reply(
        'Пожалуйста, выберите вакансию из кнопок ниже:',
        Markup.keyboard([
          [VACANCIES[0], VACANCIES[1]],
          [VACANCIES[2], VACANCIES[3]],
        ]).oneTime().resize(),
      );
    }

    session.vacancy = text;
    session.step = 'email';

    return ctx.reply('Теперь введите ваш email:', Markup.removeKeyboard());
  }

  if (session.step === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(text)) {
      return ctx.reply('Некорректный email. Попробуйте снова:');
    }

    session.email = text;

    const params = new URLSearchParams({
      name: session.name,
      vacancy: session.vacancy,
      email: session.email,
      tgId: String(session.tgId),
      ...(session.tgUsername && { tgUsername: session.tgUsername }),
    });

    const link = `${BASE_URL}?${params.toString()}`;

    await ctx.reply(
      `✅ Регистрация почти завершена!\n\nНажмите кнопку ниже, чтобы завершить регистрацию 👇`,
      {
        reply_markup: {
          inline_keyboard: [[{ text: '✅ Войти на платформе', url: link }]],
        },
        link_preview_options: { is_disabled: true },
      },
    );

    // Пример использования отложенного сообщения (можно вызвать в любой момент)
    // await scheduleMessageAt(session.tgId, 'Напоминание: подтвердите регистрацию!', Date.now() + 3600000);

    // Сброс
    ctx.session = { step: 'name', tgId: session.tgId, tgUsername: session.tgUsername };
  }
});

export default composer.middleware();