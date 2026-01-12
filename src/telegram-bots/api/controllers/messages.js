import { employeeBot, employerBot, employeeHelpBot } from "../../bots/index.js";

export const sendMessageController = async (req, res) => {
  const { botType, telegramId, text, options = {} } = req.body;

  if (!['employee', 'employer', 'employee-help'].includes(botType)) {
    return res.status(400).json({ error: 'Invalid botType' });
  }
  if (!telegramId || !text) {
    return res.status(400).json({ error: 'telegramId and text are required' });
  }

  try {
    let bot;
    if (botType == 'employee') bot = employeeBot;
    else if (botType == 'employer') bot = employerBot
    else if (botType == 'employee-help') bot = employeeHelpBot

    await bot.telegram.sendMessage(telegramId, text, options);
    res.json({ status: 'sent', telegramId });
  } catch (err) {
    console.error(`[${botType}] Send error:`, err);
    res.status(500).json({ error: err.message });
  }
};
