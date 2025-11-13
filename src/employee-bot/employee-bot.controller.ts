import { Controller } from '@nestjs/common';
import { EmployeeBotService } from './employee-bot.service';

@Controller('employee-bot')
export class EmployeeBotController {
  constructor(private readonly employeeBotService: EmployeeBotService) {}
}
