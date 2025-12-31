import { Module } from '@nestjs/common';

import { AdsController } from './ads.controller';
import { adsProviders } from './providers/ads.providers';
import { DatabaseModule } from 'src/config/database/database.module';
import { AdsService } from './ads.service';
import { StorageModule } from 'src/modules/storage/storage.module';

@Module({
  imports: [DatabaseModule, StorageModule],
  controllers: [AdsController],
  providers: [...adsProviders, AdsService],
  exports: [AdsService],
})
export class AdsModule {}
