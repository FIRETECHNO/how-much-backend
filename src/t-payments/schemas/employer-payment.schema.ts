import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type EmployerPaymentOrderDocument = HydratedDocument<EmployerPaymentOrderClass>;

@Schema({ _id: false })
class EmployerPaymentClass {
  @Prop({ type: String, required: true })
  TerminalKey: string;

  @Prop({ type: Number, required: true })
  Amount: number;

  @Prop({ type: Boolean, required: true })
  Success: boolean;

  /*
  AUTHORIZED	Операция авторизована. Деньги заблокированы на карте покупателя*.
  CONFIRMED	Операция подтверждена. Деньги списаны с карты покупателя.
  PARTIAL_REVERSED	Частичная отмена по авторизованной операции.
  REVERSED	Полная отмена по авторизованной операции.
  CANCELED	Операция отменена, когда была создана платежная ссылка.
  PARTIAL_REFUNDED	Частичный возврат по подтвержденной операции.
  REFUNDED	Полный возврат по подтвержденной операции.
  REJECTED	Списание денег закончилась ошибкой.
  DEADLINE_EXPIRED	
  Покупатель не завершил платеж в срок жизни ссылки на платежную форму. Этот срок мерчант передает в методе Инициировать платеж в параметре RedirectDueDate.
  Платеж не прошел проверку 3DS в срок и произошло автоматическое закрытие сессии**, которая превысила срок пребывания в статусе 3DS_CHECKING — более 36 часов.
  */

  @Prop({ type: String, required: true })
  Status: string;

  @Prop({ type: String, required: true })
  Token: string;

  @Prop({ type: String, required: true })
  PaymentId: string

  @Prop({ type: String, default: "" })
  PaymentURL: string
}

@Schema({ timestamps: true })
export class EmployerPaymentOrderClass {
  @Prop({
    type: Types.ObjectId,
    ref: "User",
    required: true
  })
  user: Types.ObjectId

  @Prop({
    type: String,
    default: "AUTHORIZED"
  })
  status: string

  @Prop({
    type: EmployerPaymentClass,
    default: null
  })
  payment: EmployerPaymentClass | null
}

export const EmployerPaymentOrderSchema = SchemaFactory.createForClass(EmployerPaymentOrderClass);