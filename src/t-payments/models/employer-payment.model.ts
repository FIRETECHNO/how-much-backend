import { MongooseModule } from "@nestjs/mongoose";
import { EmployerPaymentOrderSchema } from "../schemas/employer-payment.schema";

let EmployerPaymentOrderModel = MongooseModule.forFeature([{ name: 'EmployerPaymentOrder', schema: EmployerPaymentOrderSchema, collection: 'employerpaymentorders' }])
export default EmployerPaymentOrderModel