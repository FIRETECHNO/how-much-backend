import { Module } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config();

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { TokenModule } from './token/token.module';
import { UserModule } from './user/user.module';
import { RolesModule } from './roles/roles.module';
import { S3Module } from './s3/s3.module';
import { AppStateModule } from './app-state/app-state.module';
import { MailModule } from './mail/mail.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { VideoModule } from './video/video.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { JobFormModule } from './job-form/job-form.module';
import { AdminModule } from './admin/admin.module';
import { TPaymentsModule } from './t-payments/t-payments.module';
import { EmployeeBotModule } from './employee-bot/employee-bot.module';
import { ThrottlerAutoModule } from './common/throttler-auto.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/static/',
    }),
    ThrottlerModule.forRoot([{
      ttl: 1000,
      limit: 20,
      blockDuration: 10 * 60000,
    }]),
    ThrottlerAutoModule,
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URL, {
      connectionFactory: (connection) => {
        connection.plugin(require('mongoose-autopopulate'));
        return connection;
      },
    }),
    AuthModule,
    TokenModule,
    UserModule,
    RolesModule,
    S3Module,
    AppStateModule,
    MailModule,
    VideoModule,
    JobFormModule,
    AdminModule,
    TPaymentsModule,
    EmployeeBotModule,
  ],
  controllers: [AppController],
  providers: [AppService], // ← без APP_GUARD!
})
export class AppModule { }