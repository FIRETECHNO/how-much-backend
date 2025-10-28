import { Module } from '@nestjs/common';
import { TPaymentsService } from './t-payments.service';
import { TPaymentsController } from './t-payments.controller';
import EmployerPaymentOrderModel from './models/employer-payment.model';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [TPaymentsController],
  providers: [TPaymentsService],
  imports: [EmployerPaymentOrderModel, HttpModule]
})
export class TPaymentsModule { }
