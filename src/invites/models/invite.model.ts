import { MongooseModule } from "@nestjs/mongoose";
import { InviteSchema } from "../schemas/invite.schema";

let InviteModel = MongooseModule.forFeature([{ name: 'Invite', schema: InviteSchema, collection: 'invites' }])
export default InviteModel