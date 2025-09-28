import { MongooseModule } from "@nestjs/mongoose";
import { JobReservationSchema } from "../schemas/job-reservation.schema";

let JobReservationModel = MongooseModule.forFeature([{ name: 'JobReservation', schema: JobReservationSchema, collection: 'job-reservations' }])
export default JobReservationModel