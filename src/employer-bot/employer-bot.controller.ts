import { Controller } from '@nestjs/common';
import { EmployerBotService } from './employer-bot.service';

@Controller('employer-bot')
export class EmployerBotController {
  constructor(private readonly employerBotService: EmployerBotService) { }
}
