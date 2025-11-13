import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Автоматически применяет ThrottlerGuard только к HTTP-запросам.
 * Не затрагивает WebSocket, Microservices, Telegram и т.д.
 */
@Injectable()
export class ThrottlerAutoGuard extends ThrottlerGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Применяем только к HTTP
    if (context.getType() !== 'http') {
      return true; // пропускаем не-HTTP
    }
    return super.canActivate(context);
  }
}