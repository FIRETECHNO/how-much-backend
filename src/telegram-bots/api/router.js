// api/router.js
import express from 'express';
import { sendMessageController } from './controllers/messages.js';
import { scheduleMessageController } from "./controllers/schedule.js"

const router = express.Router();

// Защита (опционально): проверяем секретный ключ из .env
router.use((req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.TG_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

// Отправить мгновенное сообщение
router.post('/send', sendMessageController);

// Запланировать отложенное сообщение
router.post('/schedule', scheduleMessageController);

export default router;