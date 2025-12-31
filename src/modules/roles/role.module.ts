import { Module } from '@nestjs/common';

import { RoleService } from './role.service';
import { RoleController } from './role.controller';

import { DatabaseModule } from 'src/config/database/database.module';
import { roleProviders } from './providers/role.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [RoleController],
  providers: [RoleService, ...roleProviders],
  exports: [RoleService],
})
export class RoleModule {}
