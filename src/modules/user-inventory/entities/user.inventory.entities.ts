import { Expose, Transform, Type } from 'class-transformer';

import { AdminInventoryEntity } from 'src/modules/admin-inventory/entities/admin.inventory.entity';

export class UserInventoryItemEntity {
  @Expose()
  @Transform(({ obj }) => {
    const source = obj as { prizeId?: unknown };
    const prizeId = source.prizeId;

    if (typeof prizeId === 'string') return prizeId;

    if (prizeId && typeof prizeId === 'object') {
      const maybeWithId = prizeId as { _id?: unknown };
      const id = maybeWithId._id ?? prizeId;
      return typeof id === 'string' || typeof id === 'number'
        ? String(id)
        : undefined;
    }

    return undefined;
  })
  prizeId: string;

  @Expose()
  quantity: number;

  @Expose()
  expiresAt?: Date;

  @Expose()
  @Type(() => AdminInventoryEntity)
  prize?: AdminInventoryEntity;

  constructor(partial: Partial<UserInventoryItemEntity>) {
    Object.assign(this, partial);
  }
}

export class UseUserInventoryItemResultEntity {
  @Expose()
  prizeId: string;

  @Expose()
  quantityUsed: number;

  @Expose()
  @Type(() => AdminInventoryEntity)
  prize: AdminInventoryEntity;

  @Expose()
  awardedPoints?: number;

  constructor(partial: Partial<UseUserInventoryItemResultEntity>) {
    Object.assign(this, partial);
  }
}
