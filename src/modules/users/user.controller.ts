import { Controller, Get, Query, UseGuards, Param } from '@nestjs/common';
import { ResponseMessage, Roles } from 'src/common/http';

import { PaginationQueryDto } from 'src/common/dto/pagination.dto';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles('admin')
  @ResponseMessage('Users retrieved successfully')
  getUsers(@Query() paginationQuery: PaginationQueryDto) {
    return this.userService.findAll(paginationQuery);
  }

  @Get(':id')
  @Roles('admin', 'user')
  @ResponseMessage('User retrieved successfully')
  getUserById(@Param('id') id: string) {
    return this.userService.findById(id);
  }
}
