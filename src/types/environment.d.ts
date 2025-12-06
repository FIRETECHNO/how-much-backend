export { }

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string
      HTTPS: string

      MONGO_URL: string
      CLIENT_URL: string

      JWT_ACCESS_SECRET: string
      JWT_REFRESH_SECRET: string

      EMAIL: string
      EMAIL_PASSWORD: string

      YC_KEY_ID: string
      YC_SECRET: string
      YC_BUCKET_NAME: string

      ADMIN_EMAILS: string

      TG_EMPLOYEE_REGISTRATION_BOT_TOKEN: string

      API_URL: string
      T_BANK_TERMINAL_ID: string
      T_BANK_TERMINAL_PASSWORD: string
      T_BANK_PAYMENT_INIT_URL: string

      REDIS_HOST: string
      REDIS_PORT: string
    }
  }
}
