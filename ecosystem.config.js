module.exports = {
  apps: [
    {
      name: 'nest-backend',
      script: 'dist/main.js',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'telegram-bots',
      cwd: './src/telegram-bots',
      script: 'index.js',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'max-bot',
      cwd: './src/telegram-bots',
      script: 'max-bot/index.js',
      env: {
        NODE_ENV: 'production',
        MAX_BOT_TOKEN: process.env.MAX_BOT_TOKEN,
        CLIENT_URL: process.env.CLIENT_URL,
      },
    },
  ],
};
