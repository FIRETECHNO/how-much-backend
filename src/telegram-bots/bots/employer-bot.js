import { Composer, Markup } from 'telegraf';

const composer = new Composer();

const BASE_URL = new URL('registration/employer', process.env.CLIENT_URL).toString();

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
    inn: undefined,
    email: undefined,
  };

  await ctx.reply('👋 Добро пожаловать! Давайте зарегистрируем вас как работодателя.\n\nКак вас зовут?');
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
    session.step = 'inn';
    return ctx.reply('Укажите ИНН вашей компании (10 или 12 цифр):');
  }

  if (session.step === 'inn') {
    const innRegex = /^\d{10,12}$/;
    if (!innRegex.test(text)) {
      return ctx.reply('ИНН должен содержать 10 или 12 цифр. Попробуйте снова:');
    }
    session.inn = text;
    session.step = 'email';
    return ctx.reply('Теперь укажите рабочий email компании:');
  }

  if (session.step === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(text)) {
      return ctx.reply('Некорректный email. Попробуйте снова:');
    }

    session.email = text;

    const params = new URLSearchParams({
      name: session.name,
      inn: session.inn,
      email: session.email,
      tgId: String(session.tgId),
      ...(session.tgUsername && { tgUsername: session.tgUsername }),
    });

    const link = `${BASE_URL}?${params.toString()}`;

    await ctx.reply(
      `✅ Регистрация почти завершена!\n\nНажмите кнопку ниже, чтобы завершить 👇`,
      {
        reply_markup: {
          inline_keyboard: [[{ text: '✅ Завершить регистрацию', url: link }]],
        },
        link_preview_options: { is_disabled: true },
      },
    );

    ctx.session = {
      step: 'name',
      tgId: session.tgId,
      tgUsername: session.tgUsername,
    };
  }
});

export default composer.middleware();