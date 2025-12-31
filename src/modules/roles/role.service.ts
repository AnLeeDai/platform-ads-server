import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { plainToInstance } from 'class-transformer';

import { RoleDocument } from './schema/role.schema';
import { RoleEntity } from './entities/role.entity';
import { PaginationOptions } from 'src/common/http';
import { PaginatedResponseEntity } from 'src/common/entities';
import { paginateQuery } from 'src/common/utils/pagination.util';

@Injectable()
export class RoleService {
  constructor(
    @Inject('ROLE_MODEL')
    private readonly roleModel: Model<RoleDocument>,
  ) {}

  async findAll(
    paginationOptions: PaginationOptions,
  ): Promise<PaginatedResponseEntity<RoleEntity>> {
    const result = await paginateQuery(this.roleModel, {}, paginationOptions, {
      sort: { createdAt: -1 },
    });

    const roles = plainToInstance(RoleEntity, result.items, {
      excludeExtraneousValues: true,
    });

    return new PaginatedResponseEntity({
      items: roles,
      meta: result.meta,
    });
  }

  async findByName(name: string): Promise<RoleEntity | null> {
    const role = await this.roleModel.findOne({ name }).exec();

    if (!role) {
      return null;
    }

    return plainToInstance(RoleEntity, role.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  async findByNameAsDocument(name: string): Promise<RoleDocument | null> {
    return await this.roleModel.findOne({ name }).exec();
  }
}
