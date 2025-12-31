import { Module } from '@nestjs/common';
import { StorageService } from 'src/modules/storage/storage.service';
import { StorageController } from 'src/modules/storage/storage.controller';

@Module({
  controllers: [StorageController],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
