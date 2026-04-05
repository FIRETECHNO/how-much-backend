import 'dotenv/config';
import { Bot, Keyboard } from '@maxhub/max-bot-api';

const bot = new Bot(process.env.MAX_BOT_TOKEN);

const CLIENT_URL = process.env.CLIENT_URL || 'https://how-much.firetechno.ru';
const BASE_URL_EMPLOYEE = new URL(
  'registration/employee',
  CLIENT_URL,
).toString();
const BASE_URL_EMPLOYER = new URL(
  'registration/employer',
  CLIENT_URL,
).toString();

const VACANCIES = ['Продажи', 'Маркетинг', 'Ассистент', 'Другое'];

const userSessions = new Map();

function getSession(userId) {
  if (!userSessions.has(userId)) {
    userSessions.set(userId, {
      step: null,
      tgId: userId,
      tgUsername: null,
      name: null,
      vacancy: null,
      email: null,
      inn: null,
    });
  }
  return userSessions.get(userId);
}

function clearSession(userId) {
  userSessions.delete(userId);
}

const keyboard = Keyboard.inlineKeyboard([
  [Keyboard.button.callback('👔 Я работодатель', 'type:employer')],
  [Keyboard.button.callback('👷 Я соискатель', 'type:employee')],
  [Keyboard.button.callback('🆘 Техническая поддержка', 'type:help')],
]);

const vacancyKeyboard = Keyboard.inlineKeyboard([
  [Keyboard.button.callback(VACANCIES[0], `vacancy:${VACANCIES[0]}`)],
  [Keyboard.button.callback(VACANCIES[1], `vacancy:${VACANCIES[1]}`)],
  [Keyboard.button.callback(VACANCIES[2], `vacancy:${VACANCIES[2]}`)],
  [Keyboard.button.callback(VACANCIES[3], `vacancy:${VACANCIES[3]}`)],
]);

async function sendWelcome(ctx) {
  await ctx.reply(
    '👋 Добро пожаловать в бот платформы *СКОЛЬКО*\n\nВыберите, кто вы:',
    { attachments: [keyboard] },
  );
}

bot.command('start', async (ctx) => {
  clearSession(ctx.user.user_id);
  await sendWelcome(ctx);
});

bot.callbackQuery('type:employer', async (ctx) => {
  await ctx.answerCallbackQuery();
  const session = getSession(ctx.user.user_id);
  session.tgUsername = ctx.user.nickname || null;
  session.step = 'inn';
  await ctx.reply('👔 Регистрация работодателя\n\nКак вас зовут?');
});

bot.callbackQuery('type:employee', async (ctx) => {
  await ctx.answerCallbackQuery();
  const session = getSession(ctx.user.user_id);
  session.tgUsername = ctx.user.nickname || null;
  session.step = 'name';
  await ctx.reply('👷 Регистрация соискателя\n\nКак вас зовут?');
});

bot.callbackQuery('type:help', async (ctx) => {
  await ctx.answerCallbackQuery();
  const session = getSession(ctx.user.user_id);
  session.tgUsername = ctx.user.nickname || null;
  session.step = 'help_ask';
  await ctx.reply(
    '🆘 Техническая поддержка\n\n' +
      'Напишите ваш вопрос или проблему — мы передадим в поддержку.\n' +
      'Обычно отвечают в течение 5–30 минут в рабочее время.',
  );
});

bot.callbackQuery(/^vacancy:/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const vacancy = ctx.callbackData.replace('vacancy:', '');
  const session = getSession(ctx.user.user_id);

  if (session.step === 'vacancy') {
    session.vacancy = vacancy;
    session.step = 'email';
    await ctx.reply('Теперь введите ваш email:');
  }
});

bot.on('message_created', async (ctx) => {
  const text = ctx.message.body.text?.trim();
  if (!text) return;
  if (ctx.message.sender.is_bot) return;

  const userId = ctx.user.user_id;
  const session = getSession(userId);

  if (text.startsWith('/')) return;

  if (session.step === 'name') {
    if (text.length < 2) {
      return ctx.reply(
        'Имя должно быть не короче 2 символов. Попробуйте снова:',
      );
    }
    session.name = text;
    session.step = 'vacancy';
    await ctx.reply('На какую вакансию вы хотите устроиться?', {
      attachments: [vacancyKeyboard],
    });
    return;
  }

  if (session.step === 'vacancy') {
    return ctx.reply('Пожалуйста, выберите вакансию из кнопок ниже:', {
      attachments: [vacancyKeyboard],
    });
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
    });
    if (session.tgUsername) params.append('tgUsername', session.tgUsername);

    const link = `${BASE_URL_EMPLOYEE}?${params.toString()}`;

    await ctx.reply(
      '✅ Регистрация почти завершена!\n\nНажмите кнопку ниже, чтобы завершить регистрацию 👇',
      {
        attachments: [
          Keyboard.inlineKeyboard([
            [Keyboard.button.link('✅ Войти на платформе', link)],
          ]),
        ],
      },
    );

    clearSession(userId);
    return;
  }

  if (session.step === 'inn') {
    if (text.length < 2) {
      return ctx.reply(
        'Имя должно быть не короче 2 символов. Попробуйте снова:',
      );
    }
    session.name = text;
    session.step = 'inn_number';
    await ctx.reply('Укажите ИНН вашей компании (10 или 12 цифр):');
    return;
  }

  if (session.step === 'inn_number') {
    const innRegex = /^\d{10,12}$/;
    if (!innRegex.test(text)) {
      return ctx.reply(
        'ИНН должен содержать 10 или 12 цифр. Попробуйте снова:',
      );
    }
    session.inn = text;
    session.step = 'email_employer';
    await ctx.reply('Теперь укажите рабочий email компании:');
    return;
  }

  if (session.step === 'email_employer') {
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
    });
    if (session.tgUsername) params.append('tgUsername', session.tgUsername);

    const link = `${BASE_URL_EMPLOYER}?${params.toString()}`;

    await ctx.reply(
      '✅ Регистрация почти завершена!\n\nНажмите кнопку ниже, чтобы завершить 👇',
      {
        attachments: [
          Keyboard.inlineKeyboard([
            [Keyboard.button.link('✅ Завершить регистрацию', link)],
          ]),
        ],
      },
    );

    clearSession(userId);
    return;
  }

  if (session.step === 'help_ask') {
    const supportChatId = process.env.MAX_SUPPORT_CHAT_ID;
    if (!supportChatId) {
      return ctx.reply(
        'Извините, чат поддержки не настроен. Напишите @jet_green',
      );
    }

    const messageToSupport =
      `📩 <b>Новое обращение от соискателя</b>\n\n` +
      `👤 Имя: ${ctx.user.name || 'неизвестно'}\n` +
      `🆔 ID: ${userId}\n` +
      `📧 @${ctx.user.nickname || 'нет'}\n` +
      `⏰ ${new Date().toLocaleString('ru-RU')}\n\n` +
      `Сообщение:\n${text}`;

    try {
      await bot.api.sendMessageToChat(supportChatId, messageToSupport, {
        format: 'html',
      });
      await ctx.reply(
        '✅ Сообщение отправлено в поддержку!\n\n' + 'Мы скоро ответим 🙌',
      );
    } catch (err) {
      console.error('Ошибка отправки в поддержку:', err);
      await ctx.reply(
        '😔 Что-то пошло не так... Попробуй позже или напиши @jet_green',
      );
    }

    clearSession(userId);
    return;
  }

  await sendWelcome(ctx);
});

bot.start();
console.log('MAX Bot запущен');
