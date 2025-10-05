export interface JobForm_client {
  video: {
    src: string
  }

  job: string
  fullName: string
  coverLetter: string
  phone: string
  telegram: string
  email: string
  employeeId: string | null,

  // for upload
  tmpId: number
  startDate: Date
}