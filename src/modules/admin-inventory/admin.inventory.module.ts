import { Module } from '@nestjs/common';

import { DatabaseModule } from 'src/config/database/database.module';
import { adminInventoryProviders } from './providers/admin.inventory.provider';
import { AdminInventoryController } from './admin.inventory.controller';
import { AdminInventoryService } from './admin.inventory.service';

@Module({
  imports: [DatabaseModule],
  controllers: [AdminInventoryController],
  providers: [...adminInventoryProviders, AdminInventoryService],
  exports: [AdminInventoryService, ...adminInventoryProviders],
})
export class AdminInventoryModule {}
