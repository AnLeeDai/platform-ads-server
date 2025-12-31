import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

import { SkipTransform } from './common/http';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @SkipTransform()
  getSystemInfo() {
    return this.appService.getSystemInfo();
  }
}
