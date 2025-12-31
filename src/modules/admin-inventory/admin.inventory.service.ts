import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { plainToInstance } from 'class-transformer';

import type { PaginationOptions } from 'src/common/http';
import { PaginatedResponseEntity } from 'src/common/entities';
import { paginateQuery } from 'src/common/utils/pagination.util';

import type { AdminInventoryDocument } from './schema/admin.inventory.schema';
import { AdminInventoryEntity } from './entities/admin.inventory.entity';
import { CreateAdminInventoryDto } from './dto/create.admin.inventory.dto';
import { UpdateAdminInventoryDto } from './dto/update.admin.inventory.dto';

@Injectable()
export class AdminInventoryService {
  constructor(
    @Inject('ADMIN_INVENTORY_MODEL')
    private readonly adminInventoryModel: Model<AdminInventoryDocument>,
  ) {}

  private async existsByTitle(title: string): Promise<boolean> {
    const count = await this.adminInventoryModel
      .countDocuments({ title })
      .exec();
    return count > 0;
  }

  async create(
    createDto: CreateAdminInventoryDto,
  ): Promise<AdminInventoryEntity> {
    const exists = await this.existsByTitle(createDto.title);
    if (exists) {
      throw new ConflictException('Title already in use.');
    }

    const doc = new this.adminInventoryModel(createDto);
    const saved = await doc.save();

    return plainToInstance(AdminInventoryEntity, saved.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  async findAll(
    paginationOptions: PaginationOptions,
  ): Promise<PaginatedResponseEntity<AdminInventoryEntity>> {
    const result = await paginateQuery(
      this.adminInventoryModel,
      {},
      paginationOptions,
      {
        sort: { createdAt: -1 },
      },
    );

    const items = plainToInstance(AdminInventoryEntity, result.items, {
      excludeExtraneousValues: true,
    });

    return new PaginatedResponseEntity({
      items,
      meta: result.meta,
    });
  }

  async findById(id: string): Promise<AdminInventoryEntity> {
    const doc = await this.adminInventoryModel.findById(id).exec();

    if (!doc) {
      throw new NotFoundException(
        `Admin inventory item with ID ${id} not found`,
      );
    }

    return plainToInstance(AdminInventoryEntity, doc.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  async update(
    id: string,
    updateDto: UpdateAdminInventoryDto,
  ): Promise<AdminInventoryEntity> {
    const doc = await this.adminInventoryModel.findById(id).exec();
    if (!doc) {
      throw new NotFoundException(
        `Admin inventory item with ID ${id} not found`,
      );
    }

    if (updateDto.title && updateDto.title !== doc.title) {
      const exists = await this.existsByTitle(updateDto.title);
      if (exists) {
        throw new ConflictException('Title already in use.');
      }
    }

    Object.assign(doc, updateDto);
    const saved = await doc.save();

    return plainToInstance(AdminInventoryEntity, saved.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  async delete(id: string): Promise<void> {
    const doc = await this.adminInventoryModel.findById(id).exec();
    if (!doc) {
      throw new NotFoundException(
        `Admin inventory item with ID ${id} not found`,
      );
    }

    await this.adminInventoryModel.findByIdAndDelete(id).exec();
  }
}
