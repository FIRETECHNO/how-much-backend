import { MongooseModule } from "@nestjs/mongoose";
import { JobFormSchema } from "../schemas/job-form.schema";

let JobFormModel = MongooseModule.forFeature([{ name: 'JobForm', schema: JobFormSchema, collection: 'job-forms' }])
export default JobFormModel