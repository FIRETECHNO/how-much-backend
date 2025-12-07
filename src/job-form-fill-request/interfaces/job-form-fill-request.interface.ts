export interface JobFormFillRequest {
  job: string
  employee: string
  startDate: string | null
  endDate: string | null
  manager: string | null
}
