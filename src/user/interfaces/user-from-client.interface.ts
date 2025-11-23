import type { Role } from "../../roles/interfaces/role.interface";
import type { CompanyFromDadata } from "./company.interface";
export interface UserFromClient {
  _id: string
  name: string
  surname: string
  email: string
  password: string
  tgId: number | null
  tgUsername: string | null
  roles: Role[]
  company: null | CompanyFromDadata
}
