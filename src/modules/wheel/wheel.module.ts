import { Module } from '@nestjs/common';

import { AdminInventoryModule } from 'src/modules/admin-inventory/admin.inventory.module';
import { UserInventoryModule } from 'src/modules/user-inventory/user.inventory.module';

import { WheelController } from './wheel.controller';
import { WheelService } from './wheel.service';

@Module({
  imports: [AdminInventoryModule, UserInventoryModule],
  controllers: [WheelController],
  providers: [WheelService],
})
export class WheelModule {}
