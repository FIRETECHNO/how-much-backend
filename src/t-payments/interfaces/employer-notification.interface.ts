export interface EmployerNotification {
  TerminalKey: string
  Amount: number
  OrderId: string // _id в нашей системе
  Success: boolean
  Status: string
  Token: string // подпись
}