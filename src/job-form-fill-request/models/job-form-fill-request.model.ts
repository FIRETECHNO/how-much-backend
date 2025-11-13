import { MongooseModule } from "@nestjs/mongoose";
import { JobFormFillRequestSchema } from "../schemas/job-form-fill-request.schema";

let JobFormFillRequestModel = MongooseModule.forFeature([{ name: 'JobFormFillRequest', schema: JobFormFillRequestSchema, collection: 'jobformfillrequests' }])
export default JobFormFillRequestModel