import { Injectable } from '@nestjs/common';
import * as crypto from 'node:crypto'
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import type { TBankPaymentResponse } from './interfaces/t-bank-payment-response.interface';

@Injectable()
export class TPaymentsService {
  constructor(private readonly httpService: HttpService) { }

  async createPaymentLink(
    orderId: string, price: number, email: string,
    // optional
    quantity: number = 1,
    name: string = "Доступ к платформе",
    tax: string = "none",
  ): Promise<TBankPaymentResponse | null> {
    const notificationURL = process.env.API_URL + "/t-payments/employer-callback"

    let tokenPayloadObject = {
      Amount: price * quantity,
      // NotificationURL: notificationURL,
      OrderId: orderId,
      Password: process.env.T_BANK_TERMINAL_PASSWORD,
      TerminalKey: process.env.T_BANK_TERMINAL_ID,
    }
    console.log(tokenPayloadObject);

    let tokenPayloadStr = Object.values(tokenPayloadObject).join('');
    console.log(tokenPayloadStr);

    const Token = crypto.createHash('sha256')
      .update(tokenPayloadStr, 'utf8')
      .digest('hex');

    const reqBody = {
      TerminalKey: process.env.T_BANK_TERMINAL_ID,
      Amount: price * quantity,
      OrderId: orderId,
      Token,
      NotificationUrl: notificationURL,
      Receipt: {
        Items: [{
          Name: name,
          Price: price,
          Quantity: quantity,
          Amount: price * quantity,
          Tax: tax
        }],
        Taxation: "usn_income",
        Email: email
      }
    }
    console.log(process.env.T_BANK_PAYMENT_INIT_URL);
    console.log(reqBody);

    let res = await firstValueFrom(
      this.httpService.post(process.env.T_BANK_PAYMENT_INIT_URL, reqBody)
    );
    return res.data;
  }
}
