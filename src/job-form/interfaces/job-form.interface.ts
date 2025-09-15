export interface JobForm_client {
  video: {
    src: string
  }

  job: string
  fullName: string
  coverLetter: string

  // for upload
  tmpId: number
  startDate: Date
}