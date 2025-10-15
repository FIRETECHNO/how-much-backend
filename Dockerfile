# ---------- Этап сборки ----------
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci  # Устанавливаем ВСЕ зависимости, включая dev

COPY . .
RUN npm run build  # Собираем проект

# ---------- Этап продакшена ----------
FROM node:20-alpine AS production
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production  # Только прод зависимости

# Копируем собранный код из builder
COPY --from=builder /app/dist ./dist

EXPOSE 4000
CMD ["node", "dist/main.js"]
