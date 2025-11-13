import { Module, OnModuleInit, Injectable } from '@nestjs/common';
import { DiscoveryModule, DiscoveryService, MetadataScanner } from '@nestjs/core';
import { Controller } from '@nestjs/common/interfaces';
import { ThrottlerAutoGuard } from './guards/throttler-auto.guard';

@Injectable()
export class ThrottlerAutoRegistrar implements OnModuleInit {
  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
  ) { }

  onModuleInit() {
    const controllers = this.discoveryService.getControllers();

    for (const { instance, metatype } of controllers) {
      // Пропускаем, если это не настоящий контроллер (например, Telegraf-апдейты)
      if (!metatype || !instance) continue;

      // Проверяем, что это HTTP-контроллер (а не, например, Update из telegraf)
      const isHttpController = Reflect.hasMetadata('path', metatype);

      if (isHttpController) {
        // Получаем текущие guards
        const existingGuards = Reflect.getMetadata('__guards__', metatype) || [];
        // Добавляем ThrottlerAutoGuard, если его ещё нет
        if (!existingGuards.some(g => g.prototype instanceof ThrottlerAutoGuard)) {
          Reflect.defineMetadata('__guards__', [...existingGuards, ThrottlerAutoGuard], metatype);
        }
      }
    }
  }
}

@Module({
  imports: [DiscoveryModule],
  providers: [ThrottlerAutoGuard, ThrottlerAutoRegistrar],
  exports: [ThrottlerAutoGuard],
})
export class ThrottlerAutoModule { }