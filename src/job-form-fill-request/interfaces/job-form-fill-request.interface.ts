export interface JobFormFillRequest {
  job: string
  employee: string
  startDate: string | null
  endDate: string | null
  manager: string | null
}

export interface JobFormFillRequestDB extends JobFormFillRequest {
  _id: string
  createdAt: string
  updatedAt: string
}