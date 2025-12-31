import { Module } from '@nestjs/common';

import { DatabaseModule } from 'src/config/database/database.module';
import { userProviders } from './providers/user.provider';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [UserController],
  providers: [...userProviders, UserService],
  exports: [UserService],
})
export class UserModule {}
