import {
  Body,
  Get,
  Controller,
  Inject,
  Post,
  UseGuards,
  Query,
  Param,
} from '@nestjs/common';

import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { ResponseMessage, Roles } from 'src/common/http';
import { PaginationQueryDto } from 'src/common/dto/pagination.dto';
import { UserInventoryService } from './user.inventory.service';
import { UseUserInventoryItemDto } from './dto/use.user.inventory.dto';

type UserInventoryApi = {
  getUserItems: (
    userId: string,
    paginationQuery: PaginationQueryDto,
  ) => Promise<unknown>;
  consumeItem: (params: {
    userId: string;
    prizeId: string;
    quantity?: number;
  }) => Promise<unknown>;
};

@Controller('user-inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserInventoryController {
  constructor(
    @Inject(UserInventoryService)
    private readonly userInventoryService: UserInventoryApi,
  ) {}

  @Get('/user/:userId/items')
  @Roles('admin', 'user')
  @ResponseMessage("User's inventory items retrieved successfully")
  getUserItems(
    @Param('userId') userId: string,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    return this.userInventoryService.getUserItems(userId, paginationQuery);
  }

  @Post('/user/:userId/items/:prizeId/use')
  @Roles('admin', 'user')
  @ResponseMessage('Inventory item used successfully')
  useItem(
    @Param('userId') userId: string,
    @Param('prizeId') prizeId: string,
    @Body() body: UseUserInventoryItemDto,
  ) {
    return this.userInventoryService.consumeItem({
      userId,
      prizeId,
      quantity: body.quantity,
    });
  }
}
