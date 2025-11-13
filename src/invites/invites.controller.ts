import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { InvitesService } from './invites.service';
import { CreateInvitePayload } from './interfaces/invite.interface'; // Импортируем наш интерфейс
import { AdminAuthGuard } from 'src/auth/admin.guard';

@Controller('invites')
export class InvitesController {
  constructor(private readonly invitesService: InvitesService) { }

  // Эндпоинт для администратора для создания инвайта
  @UseGuards(AdminAuthGuard)
  @Post("create")
  async create(@Body() payload: CreateInvitePayload) { // Используем интерфейс для типизации тела запроса
    const { email, role } = payload;
    await this.invitesService.create(email, role);
    return { message: 'Приглашение успешно отправлено.' };
  }

  @UseGuards(AdminAuthGuard)
  @Get("get-all")
  async getAllInvites() {
    return await this.invitesService.getInvites();
  }

  // Публичный эндпоинт для фронтенда для проверки токена
  @Post('validate-invite-token')
  async validate(
    @Body('inviteToken') token: string
  ) {
    const invite = await this.invitesService.validate(token);
    // Возвращаем только email, чтобы фронтенд мог предзаполнить поле
    return { email: invite.email };
  }
}