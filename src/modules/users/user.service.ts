import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import mongoose, { Model } from 'mongoose';
import { plainToInstance } from 'class-transformer';

import { UserDocument } from './schema/user.schema';
import { UserEntity } from './entities/user.entity';
import { PaginationOptions } from 'src/common/http';
import { PaginatedResponseEntity } from 'src/common/entities';
import { paginateQuery } from 'src/common/utils/pagination.util';

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_MODEL')
    private readonly userModel: Model<UserDocument>,
  ) {}

  async findAll(
    paginationOptions: PaginationOptions,
  ): Promise<PaginatedResponseEntity<UserEntity>> {
    const result = await paginateQuery(this.userModel, {}, paginationOptions, {
      sort: { createdAt: -1 },
    });

    const users = plainToInstance(UserEntity, result.items, {
      excludeExtraneousValues: true,
    });

    return new PaginatedResponseEntity({
      items: users,
      meta: result.meta,
    });
  }

  async findById(id: string): Promise<UserEntity> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid user ID format: ${id}`);
    }

    const user = await this.userModel
      .findById(new mongoose.Types.ObjectId(id))
      .exec();

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return plainToInstance(UserEntity, user.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return await this.userModel.findOne({ email }).exec();
  }

  async findByEmailAsEntity(email: string): Promise<UserEntity | null> {
    const user = await this.userModel.findOne({ email }).exec();

    if (!user) {
      return null;
    }

    return plainToInstance(UserEntity, user.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.userModel.countDocuments({ email }).exec();
    return count > 0;
  }

  async existsByUsername(username: string): Promise<boolean> {
    const count = await this.userModel.countDocuments({ username }).exec();
    return count > 0;
  }

  async existsByPhoneNumber(phoneNumber: string): Promise<boolean> {
    const count = await this.userModel.countDocuments({ phoneNumber }).exec();
    return count > 0;
  }

  async create(userData: Partial<UserDocument>): Promise<UserEntity> {
    const createdUser = new this.userModel(userData);
    const savedUser = await createdUser.save();

    return plainToInstance(UserEntity, savedUser.toObject(), {
      excludeExtraneousValues: true,
    });
  }
}
