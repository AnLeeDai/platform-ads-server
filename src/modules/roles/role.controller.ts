import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { RoleService } from './role.service';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { ResponseMessage, Roles } from '../../common/http/decorators';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @Roles('admin')
  @ResponseMessage('Roles retrieved successfully')
  getRoles(@Query() paginationQuery: PaginationQueryDto) {
    return this.roleService.findAll(paginationQuery);
  }

  @Get('by-name')
  @Roles('admin')
  @ResponseMessage('Role retrieved successfully')
  getRoleByName(@Query('name') name: string) {
    return this.roleService.findByName(name);
  }
}
