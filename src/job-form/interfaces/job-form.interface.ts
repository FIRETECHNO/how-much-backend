export interface JobForm_client {
  video: {
    src: string
  }

  job: string
  fullName: string
  coverLetter: string
  phone: string
  telegram: string

  // for upload
  tmpId: number
  startDate: Date
}