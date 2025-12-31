import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import mongoose, { Model } from 'mongoose';
import { plainToInstance } from 'class-transformer';

import type { PaginationOptions } from 'src/common/http';
import { PaginatedResponseEntity } from 'src/common/entities';
import {
  buildPaginationMeta,
  normalizePaginationOptions,
} from 'src/common/utils/pagination.util';
import type { AdminInventoryDocument } from 'src/modules/admin-inventory/schema/admin.inventory.schema';
import { AdminInventoryEntity } from 'src/modules/admin-inventory/entities/admin.inventory.entity';
import { PointService } from 'src/modules/point/point.service';
import {
  UseUserInventoryItemResultEntity,
  UserInventoryItemEntity,
} from './entities/user.inventory.entities';
import type { UserInventoryDocument } from './schema/user.inventory.schema';

@Injectable()
export class UserInventoryService {
  constructor(
    @Inject('USER_INVENTORY_MODEL')
    private readonly userInventoryModel: Model<UserInventoryDocument>,
    @Inject('ADMIN_INVENTORY_MODEL')
    private readonly adminInventoryModel: Model<AdminInventoryDocument>,
    private readonly pointService: PointService,
  ) {}

  async addItem(params: {
    userId: string;
    prizeId: string;
    quantity?: number;
    expiresAt?: Date;
  }): Promise<void> {
    const { userId, prizeId, expiresAt } = params;
    const quantity = params.quantity ?? 1;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new BadRequestException(`Invalid userId format: ${userId}`);
    }
    if (!mongoose.Types.ObjectId.isValid(prizeId)) {
      throw new BadRequestException(`Invalid prizeId format: ${prizeId}`);
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw new BadRequestException('Quantity must be a positive number');
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const prizeObjectId = new mongoose.Types.ObjectId(prizeId);

    // If item exists in inventory: increment quantity
    const updatedExisting = await this.userInventoryModel
      .findOneAndUpdate(
        { userId: userObjectId, 'items.prizeId': prizeObjectId },
        {
          $inc: { 'items.$.quantity': quantity },
          ...(expiresAt ? { $set: { 'items.$.expiresAt': expiresAt } } : {}),
        },
        { new: true },
      )
      .exec();

    if (updatedExisting) return;

    // Else push new item and upsert inventory document
    await this.userInventoryModel
      .findOneAndUpdate(
        { userId: userObjectId },
        {
          $setOnInsert: { userId: userObjectId },
          $push: {
            items: {
              prizeId: prizeObjectId,
              quantity,
              ...(expiresAt ? { expiresAt } : {}),
            },
          },
        },
        { upsert: true, new: true },
      )
      .exec();
  }

  async getUserItems(
    userId: string,
    paginationOptions: PaginationOptions,
  ): Promise<PaginatedResponseEntity<UserInventoryItemEntity>> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new BadRequestException(`Invalid userId format: ${userId}`);
    }

    const { page, limit } = normalizePaginationOptions(paginationOptions);
    const skip = (page - 1) * limit;

    const doc = await this.userInventoryModel
      .findOne({ userId: new mongoose.Types.ObjectId(userId) })
      .populate('items.prizeId')
      .lean()
      .exec();

    const allItems = (doc?.items ?? []) as Array<{
      prizeId: unknown;
      quantity: number;
      expiresAt?: Date;
    }>;

    const sliced = allItems.slice(skip, skip + limit).map((i) => {
      const prizeDoc = i.prizeId as any;
      const resolvedPrizeId = (prizeDoc?._id ?? prizeDoc)?.toString();
      const prize =
        prizeDoc && typeof prizeDoc === 'object' && prizeDoc._id
          ? plainToInstance(AdminInventoryEntity, prizeDoc, {
              excludeExtraneousValues: true,
            })
          : undefined;

      return plainToInstance(
        UserInventoryItemEntity,
        {
          prizeId: resolvedPrizeId,
          quantity: i.quantity,
          expiresAt: i.expiresAt,
          prize,
        },
        { excludeExtraneousValues: true },
      );
    });

    return new PaginatedResponseEntity<UserInventoryItemEntity>({
      items: sliced,
      meta: buildPaginationMeta(page, limit, allItems.length),
    });
  }

  async consumeItem(params: {
    userId: string;
    prizeId: string;
    quantity?: number;
  }): Promise<UseUserInventoryItemResultEntity> {
    const { userId, prizeId } = params;
    const quantity = params.quantity ?? 1;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new BadRequestException(`Invalid userId format: ${userId}`);
    }
    if (!mongoose.Types.ObjectId.isValid(prizeId)) {
      throw new BadRequestException(`Invalid prizeId format: ${prizeId}`);
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw new BadRequestException('Quantity must be a positive number');
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const prizeObjectId = new mongoose.Types.ObjectId(prizeId);

    const updated = await this.userInventoryModel
      .findOneAndUpdate(
        {
          userId: userObjectId,
          items: {
            $elemMatch: {
              prizeId: prizeObjectId,
              quantity: { $gte: quantity },
            },
          },
        },
        { $inc: { 'items.$.quantity': -quantity } },
        { new: true },
      )
      .exec();

    if (!updated) {
      throw new NotFoundException(
        'Inventory item not found or insufficient quantity',
      );
    }

    // Clean up zero-quantity items
    await this.userInventoryModel
      .updateOne(
        { userId: userObjectId },
        { $pull: { items: { quantity: { $lte: 0 } } } },
      )
      .exec();

    const prizeDoc = await this.adminInventoryModel
      .findById(prizeObjectId)
      .exec();
    if (!prizeDoc) {
      throw new NotFoundException('Prize not found');
    }

    if (
      prizeDoc.type === 'COUPON' &&
      prizeDoc.expiresAt &&
      prizeDoc.expiresAt.getTime() <= Date.now()
    ) {
      throw new BadRequestException('Coupon is expired');
    }

    const prize = plainToInstance(AdminInventoryEntity, prizeDoc.toObject(), {
      excludeExtraneousValues: true,
    });

    // Apply effect on confirmation
    let awardedPoints: number | undefined;
    if (prizeDoc.type === 'POINT') {
      const amount = prizeDoc.value * quantity;
      await this.pointService.adjustPoints({
        userId,
        amount,
        description: `Reward claimed: ${prizeDoc.title}`,
        type: 'WHEEL',
      });
      awardedPoints = amount;
    }

    return plainToInstance(
      UseUserInventoryItemResultEntity,
      {
        prizeId,
        quantityUsed: quantity,
        prize,
        awardedPoints,
      },
      { excludeExtraneousValues: true },
    );
  }
}
