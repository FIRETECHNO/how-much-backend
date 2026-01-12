import { Composer, Markup } from 'telegraf';

const composer = new Composer();

const SUPPORT_CHAT_ID = process.env.TG_EMPLOYEE_HELP_CHAT_ID;

if (!SUPPORT_CHAT_ID) {
  console.error('Ошибка: TG_EMPLOYEE_HELP_CHAT_ID не указан в .env');
  process.exit(1);
}

// Хранилище активных обращений
const activeRequests = new Map(); // userId → { messageId, timestamp, originalText }

// Приветствие /start
composer.start(async (ctx) => {
  const firstName = ctx.from.first_name || 'друг';
  await ctx.reply(
    `👋 Привет, ${firstName}!\n\n` +
    `Я — бот-помощник для соискателей платформы *СКОЛЬКО*.\n\n` +
    `Просто напиши любой вопрос или проблему — я передам в поддержку.\n` +
    `Обычно отвечают в течение 5–30 минут в рабочее время.\n\n` +
    `⚠️ Пока не получил ответ — можешь написать только одно сообщение.`
  );
});

// Команда /help
composer.command('help', async (ctx) => {
  await ctx.reply(
    '❓ Как пользоваться ботом\n\n' +
    'Пиши любой текст — вопрос, жалобу, предложение. Всё придёт в поддержку.\n\n' +
    'Пока не получил ответ — можешь отправить только одно сообщение.\n\n' +
    'Примеры:\n' +
    '• Не могу загрузить видео\n' +
    '• Когда будет собеседование?\n' +
    '• Хочу изменить телефон\n\n' +
    'Мы на связи!'
  );
});

// Функция экранирования HTML
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}



// Ответ от поддержки → пользователю
// Работает только в чате поддержки (SUPPORT_CHAT_ID)
composer.command('reply', async (ctx) => {
  // Проверяем, что команда отправлена из чата поддержки
  if (String(ctx.chat.id) !== SUPPORT_CHAT_ID) {
    return; // игнорируем, если не из поддержки
  }

  const replyToMessage = ctx.message.reply_to_message;
  if (!replyToMessage) {
    return ctx.reply('Ответь на сообщение пользователя командой /reply');
  }

  const text = ctx.message.text.replace(/^\/reply\s+/, '').trim();
  if (!text) {
    return ctx.reply('Напиши текст ответа после /reply');
  }

  // Ищем userId в тексте сообщения (🆔 ID: 123456789)
  const userIdMatch = replyToMessage.text.match(/🆔 ID: (\d+)/);
  if (!userIdMatch) {
    return ctx.reply('Не удалось найти ID пользователя в этом сообщении');
  }

  const userId = Number(userIdMatch[1]);

  try {
    await ctx.telegram.sendMessage(userId,
      `👋 Ответ от поддержки:\n\n${text}\n\n` +
      `Если нужно — продолжай писать сюда!`
    );

    // Снимаем лимит — пользователь может отправить новое обращение
    activeRequests.delete(userId);

    await ctx.reply(`Ответ отправлен пользователю ${userId}! ✅`);
  } catch (err) {
    console.error('Ошибка отправки ответа:', err);
    await ctx.reply('Не удалось отправить ответ пользователю 😔');
  }
});

// Обращение от пользователя → в поддержку
composer.on('text', async (ctx) => {
  // Пропускаем команды
  if (ctx.message.text.startsWith('/')) return;

  const userId = ctx.from.id;
  const text = ctx.message.text.trim();

  // Проверяем лимит
  if (activeRequests.has(userId)) {
    const { timestamp } = activeRequests.get(userId);
    const timeAgo = Math.floor((Date.now() - timestamp) / 1000 / 60);
    await ctx.reply(
      `⚠️ Ты уже отправил обращение ${timeAgo} минут назад.\n` +
      `Дождись ответа от поддержки, прежде чем писать новое.\n\n` +
      `Если долго нет ответа — напиши @jet_green`
    );
    return;
  }

  const messageToSupport =
    '📩 <b>Новое обращение от соискателя</b>\n\n' +
    `👤 Имя: ${escapeHtml(ctx.from.first_name)} ${escapeHtml(ctx.from.last_name || '')}\n` +
    `🆔 ID: ${userId}\n` +
    `📧 @${escapeHtml(ctx.from.username || 'нет')}\n` +
    `⏰ ${new Date().toLocaleString('ru-RU')}\n\n` +
    `Сообщение:\n${escapeHtml(text)}`;

  try {
    const sentMessage = await ctx.telegram.sendMessage(SUPPORT_CHAT_ID, messageToSupport, {
      parse_mode: 'HTML'
    });

    // Сохраняем обращение
    activeRequests.set(userId, {
      messageId: sentMessage.message_id,
      timestamp: Date.now(),
      originalText: text
    });

    await ctx.reply(
      '✅ Сообщение отправлено в поддержку!\n\n' +
      'Мы скоро ответим 🙌\n' +
      'Пока ждёшь — можешь отправить только одно сообщение.'
    );
  } catch (err) {
    console.error('Ошибка отправки в поддержку:', err);
    await ctx.reply('😔 Что-то пошло не так... Попробуй позже или напиши @jet_green');
  }
});
// Экспорт middleware
export default composer.middleware();