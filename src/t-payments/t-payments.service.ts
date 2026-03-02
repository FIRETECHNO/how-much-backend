import { Injectable } from '@nestjs/common';
import * as crypto from 'node:crypto'
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import type { TBankPaymentResponse } from './interfaces/t-bank-payment-response.interface';

@Injectable()
export class TPaymentsService {
  constructor(private readonly httpService: HttpService) { }

  private generateRequestToken(tokenPayload: Record<string, any>): string {
    const sortedKeys = Object.keys(tokenPayload).sort();
    let tokenPayloadStr = ''

    for (const key of sortedKeys) {
      tokenPayloadStr += tokenPayload[key];
    }
    // console.log(tokenPayloadStr);

    const Token = crypto.createHash('sha256')
      .update(tokenPayloadStr, 'utf8')
      .digest('hex');
    return Token
  }

  async createPaymentLink(
    orderId: string, price: number, email: string,
    // optional
    quantity: number = 1,
    name: string = "Доступ к платформе",
    tax: string = "none",
  ): Promise<TBankPaymentResponse | null> {
    const notificationURL = new URL("/t-payments/employer-callback", process.env.API_URL).toString()

    let tokenPayloadObject = {
      Amount: price * quantity,
      // NotificationURL: notificationURL,
      Description: name,
      Password: process.env.T_BANK_TERMINAL_PASSWORD,
      OrderId: orderId,
      TerminalKey: process.env.T_BANK_TERMINAL_ID,
    }
    const Token = this.generateRequestToken(tokenPayloadObject)

    const reqBody = {
      TerminalKey: process.env.T_BANK_TERMINAL_ID,
      Amount: price * quantity,
      OrderId: orderId,
      Description: name,
      Token,
      NotificationUrl: notificationURL,
      DATA: {
        "Email": email
      },
      Receipt: {
        Taxation: "usn_income",
        FfdVersion: "1.05",
        Email: email,
        Items: [{
          Name: name,
          Price: price,
          Quantity: quantity,
          Amount: price * quantity,
          Tax: tax
        }],
      }
    }
    console.log(JSON.stringify(reqBody));

    let res = await firstValueFrom(
      this.httpService.post(process.env.T_BANK_PAYMENT_INIT_URL, reqBody)
    );
    return res.data;
  }

  async cancelPayment(
    paymentId: string,
  ) {
    const cancelApiUrl = new URL("Cancel", process.env.T_BANK_API_URL).toString()
    let tokenPayloadObject = {
      Password: process.env.T_BANK_TERMINAL_PASSWORD,
      PaymentId: paymentId,
      TerminalKey: process.env.T_BANK_TERMINAL_ID,
    }

    const Token = this.generateRequestToken(tokenPayloadObject)

    const reqBody = {
      TerminalKey: process.env.T_BANK_TERMINAL_ID,
      PaymentId: paymentId,
      Token,
    }

    let res = await firstValueFrom(
      this.httpService.post(cancelApiUrl, reqBody)
    );
    return res.data;
  }
}
/*{
  Success: true,
  ErrorCode: '0',
  TerminalKey: '1769605513305DEMO',
  Status: 'NEW',
  PaymentId: '8064497361',
  OrderId: '69a3e15d08adb3bf7e982c15',
  Amount: 10000,
  PaymentURL: 'https://pay.tbank.ru/nW04lLo8'
}*/