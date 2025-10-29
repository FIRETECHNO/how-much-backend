import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, Res } from '@nestjs/common';
import { TPaymentsService } from './t-payments.service';
import { Response } from 'express';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import type { EmployerNotification } from './interfaces/employer-notification.interface';
import { EmployerPaymentOrderClass } from './schemas/employer-payment.schema';
import ApiError from 'src/exceptions/errors/api-error';

@Controller('t-payments')
export class TPaymentsController {
  constructor(private readonly tPaymentsService: TPaymentsService,
    @InjectModel('EmployerPaymentOrder') private EmployerPaymentOrderModel: Model<EmployerPaymentOrderClass>,
  ) { }


  @Post("create-employer-order")
  async createEmployerOrder(
    @Body("employerId") employerId: string,
    @Body("amount") amount: number,
    @Body("email") email: string,
  ) {
    let order = await this.EmployerPaymentOrderModel.create({ user: employerId })

    if (!order._id) {
      throw ApiError.BadRequest("Ошибка при создании платежа")
    }

    let result = await this.tPaymentsService.createPaymentLink(order._id.toString(), amount, email)
    console.log(result);

    if (result.Success) {
      let orderFinal = await this.EmployerPaymentOrderModel.findByIdAndUpdate(
        result.OrderId,
        {
          $set: {
            status: result.Status,
            payment: {
              TerminalKey: result.TerminalKey,
              Amount: result.Amount,
              Success: result.Success,
              Status: result.Status,
              PaymentId: result.PaymentId,
              PaymentURL: result?.PaymentURL || ""
            }
          }
        },
        { new: true }
      )

      return orderFinal
    }
    return null;
  }


  @Post("employer-callback")
  async create(
    @Body() tbankNotification: EmployerNotification,
    @Res() res: Response
  ) {
    // ok status
    return res.status(HttpStatus.OK).send("OK")
    // error status
    return res.status(HttpStatus.UNPROCESSABLE_ENTITY).send()
  }
}
