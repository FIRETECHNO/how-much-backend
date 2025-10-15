# 1. Базовый образ Node.js
FROM node:20-alpine

# 2. Рабочая директория
WORKDIR /app

# 3. Копируем package.json и package-lock.json (или yarn.lock)
COPY package*.json ./

# 4. Устанавливаем зависимости
RUN npm ci --only=production

# 5. Копируем весь проект
COPY . .

# 6. Собираем проект (если используешь TypeScript)
RUN npm run build

# 7. Порт внутри контейнера
EXPOSE 4000

# 8. Команда запуска
CMD ["node", "dist/main.js"]
