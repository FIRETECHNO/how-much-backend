import { Controller, Get, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Request } from "express"

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectConnection() private connection: Connection
  ) {
  }
  @Get()
  getHello(): string {
    return this.appService.getHello()
  }

  @Get('my-ip')
  getIp(@Req() req: Request) {
    return {
      ip: req.ip,
      'x-forwarded-for': req.headers['x-forwarded-for'],
      remoteAddress: req?.connection?.remoteAddress,
    };
  }
}
