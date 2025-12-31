import {
  Get,
  Controller,
  UseGuards,
  Query,
  Param,
  Body,
  UseInterceptors,
  Put,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { ResponseMessage, Roles, Serialize } from 'src/common/http';
import { PaginationQueryDto } from 'src/common/dto/pagination.dto';
import { PointService } from './point.service';
import { AdjustPointDto } from './dto/update.point.dto';
import {
  PointBalanceEntity,
  PointHistoryEntity,
  UserPointSummaryEntity,
} from './entities/point.entities';

@Controller('points')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PointController {
  constructor(private readonly pointService: PointService) {}

  @Get('/')
  @Roles('admin')
  @ResponseMessage('All user balances retrieved successfully')
  getAllBalances(@Query() paginationQuery: PaginationQueryDto) {
    return this.pointService.findAllBalances(paginationQuery);
  }

  @Put('/update')
  @Roles('admin')
  @UseInterceptors(AnyFilesInterceptor())
  @Serialize(PointHistoryEntity)
  @ResponseMessage('User points adjusted successfully')
  adjustPoints(@Body() adjustPointDto: AdjustPointDto) {
    return this.pointService.adjustPoints(adjustPointDto);
  }

  @Get('/user/:userId/balance')
  @Roles('admin', 'user')
  @Serialize(PointBalanceEntity)
  @ResponseMessage('User balance retrieved successfully')
  getUserBalance(@Param('userId') userId: string) {
    return this.pointService.getBalance(userId);
  }

  @Get('/user/:userId/history')
  @Roles('admin', 'user')
  @ResponseMessage("User's point history retrieved successfully")
  getUserHistory(
    @Param('userId') userId: string,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    return this.pointService.getHistory(userId, paginationQuery);
  }

  @Get('/user/:userId/summary')
  @Roles('admin', 'user')
  @Serialize(UserPointSummaryEntity)
  @ResponseMessage('User point summary retrieved successfully')
  getUserSummary(@Param('userId') userId: string) {
    return this.pointService.getUserPointSummary(userId);
  }
}
