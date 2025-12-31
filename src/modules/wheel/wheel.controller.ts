import { Controller, Post, Request, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { ResponseMessage, Roles, Serialize } from 'src/common/http';

import { WheelService } from './wheel.service';
import { WheelSpinResultEntity } from './entities/wheel.entity';

@Controller('wheel')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WheelController {
  constructor(private readonly wheelService: WheelService) {}

  @Post('spin')
  @Roles('admin', 'user')
  @Serialize(WheelSpinResultEntity)
  @ResponseMessage('Wheel spun successfully')
  spin(@Request() req: { user: { userId: string } }) {
    return this.wheelService.spin(req.user.userId);
  }
}
