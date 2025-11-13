import mongoose from "mongoose"
import type { Role } from "../../roles/interfaces/role.interface";
import type { CompanyFromDadata } from "./company.interface"

export interface User {
  _id: mongoose.Types.ObjectId
  name: string
  surname: string
  email: string
  password: string
  tgId: number | null
  roles: Role[]
  company: null | CompanyFromDadata
  isModerated: boolean
  inviteToken: string | null
}
