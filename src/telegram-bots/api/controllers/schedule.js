import { messageQueue } from '../../queue.js';
import { employeeBot, employerBot } from "../../bots/index.js";

export const scheduleMessageController = async (req, res) => {
  const { botType, telegramId, text, timestamp, options = {} } = req.body;

  if (!['employee', 'employer'].includes(botType)) {
    return res.status(400).json({ error: 'Invalid botType' });
  }
  if (!telegramId || !text || !timestamp) {
    return res.status(400).json({ error: 'telegramId, text and timestamp are required' });
  }

  const now = Date.now();
  const delayMs = timestamp - now;

  if (delayMs <= 0) {
    // Отправляем сразу
    try {
      const bot = botType === 'employee' ? employeeBot : employerBot;
      await bot.telegram.sendMessage(telegramId, text, options);
      return res.json({ status: 'sent_immediately' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  try {
    await messageQueue.add(
      'send-delayed-message',
      { telegramId, text, options, botType },
      { delay: delayMs }
    );
    res.json({ status: 'scheduled', delayMs, timestamp: new Date(timestamp).toISOString() });
  } catch (err) {
    console.error(`[${botType}] Schedule error:`, err);
    res.status(500).json({ error: err.message });
  }
};