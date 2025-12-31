import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { ResponseMessage, Roles } from 'src/common/http';
import { PaginationQueryDto } from 'src/common/dto/pagination.dto';

import { AdminInventoryService } from './admin.inventory.service';
import { CreateAdminInventoryDto } from './dto/create.admin.inventory.dto';
import { UpdateAdminInventoryDto } from './dto/update.admin.inventory.dto';

@Controller('admin-inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminInventoryController {
  constructor(private readonly adminInventoryService: AdminInventoryService) {}

  @Post('create')
  @Roles('admin')
  @ResponseMessage('Admin inventory item created successfully')
  create(@Body() createDto: CreateAdminInventoryDto) {
    return this.adminInventoryService.create(createDto);
  }

  @Get('')
  @Roles('admin')
  @ResponseMessage('Admin inventory items retrieved successfully')
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.adminInventoryService.findAll(paginationQuery);
  }

  @Get(':id/detail')
  @Roles('admin')
  @ResponseMessage('Admin inventory item retrieved successfully')
  findById(@Param('id') id: string) {
    return this.adminInventoryService.findById(id);
  }

  @Put(':id/update')
  @Roles('admin')
  @ResponseMessage('Admin inventory item updated successfully')
  update(@Param('id') id: string, @Body() updateDto: UpdateAdminInventoryDto) {
    return this.adminInventoryService.update(id, updateDto);
  }

  @Delete(':id/delete')
  @Roles('admin')
  @ResponseMessage('Admin inventory item deleted successfully')
  delete(@Param('id') id: string) {
    return this.adminInventoryService.delete(id);
  }
}
