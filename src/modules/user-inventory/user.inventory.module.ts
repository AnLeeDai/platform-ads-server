import { Module } from '@nestjs/common';

import { DatabaseModule } from 'src/config/database/database.module';
import { AdminInventoryModule } from 'src/modules/admin-inventory/admin.inventory.module';
import { PointModule } from 'src/modules/point/point.module';
import { UserInventoryController } from './user.inventory.controller';
import { UserInventoryService } from './user.inventory.service';
import { userInventoryProviders } from './providers/user.inventory.provider';

@Module({
  imports: [DatabaseModule, AdminInventoryModule, PointModule],
  controllers: [UserInventoryController],
  providers: [UserInventoryService, ...userInventoryProviders],
  exports: [UserInventoryService],
})
export class UserInventoryModule {}
