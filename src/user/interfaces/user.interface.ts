import mongoose from "mongoose"
import type { Role } from "../../roles/interfaces/role.interface";
import type { CompanyFromDadata } from "./company.interface"

export interface User {
  _id: mongoose.Types.ObjectId
  name: string
  surname: string
  email: string
  password: string
  roles: Role[]
  company: null | CompanyFromDadata
  isModerated: boolean
}
