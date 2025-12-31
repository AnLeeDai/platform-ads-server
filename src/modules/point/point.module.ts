import { Module } from '@nestjs/common';

import { PointService } from './point.service';
import { pointProviders } from './providers/point.providers';
import { DatabaseModule } from 'src/config/database/database.module';
import { PointController } from './point.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [PointController],
  providers: [PointService, ...pointProviders],
  exports: [PointService],
})
export class PointModule {}
