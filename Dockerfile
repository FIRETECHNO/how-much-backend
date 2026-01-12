# ---------- Этап сборки ----------
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

# ---------- Этап продакшена ----------
FROM node:20-alpine AS production
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/telegram-bots ./src/telegram-bots
COPY --from=builder /app/ecosystem.config.js ./ecosystem.config.js

ENV NODE_ENV=production
ENV PORT=3037

EXPOSE 3037

CMD ["npx", "pm2-runtime", "ecosystem.config.js"]