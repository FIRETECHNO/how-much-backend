const sessionStore = new Map<number, any>();

export const sessionMiddleware = () => {
  return (ctx: any, next: () => Promise<void>) => {
    const id = ctx.chat?.id || ctx.from?.id;
    if (!id) {
      ctx.session = {};
      return next();
    }

    if (!sessionStore.has(id)) {
      sessionStore.set(id, {});
    }
    ctx.session = sessionStore.get(id);
    return next();
  };
};