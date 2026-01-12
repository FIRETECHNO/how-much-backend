import { session } from 'telegraf';

export function createSession(botName) {
  const store = new Map();

  return session({
    defaultSession: () => ({}),
    getSessionKey: (ctx) => {
      if (ctx.from && ctx.chat) {
        return `${botName}:${ctx.from.id}:${ctx.chat.id}`;
      }
      return null;
    },
    store,
  });
}