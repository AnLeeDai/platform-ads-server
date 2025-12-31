import { Expose, Transform } from 'class-transformer';

import type { AdminInventoryPrizeType } from '../schema/admin.inventory.schema';

export class AdminInventoryEntity {
  @Expose()
  @Transform(({ obj }) => {
    const source = obj as { _id?: unknown; id?: unknown };
    const id = source._id ?? source.id;
    return id?.toString();
  })
  _id: string;

  @Expose()
  title: string;

  @Expose()
  type: AdminInventoryPrizeType;

  @Expose()
  value: number;

  @Expose()
  quantity?: number;

  @Expose()
  expiresAt?: Date;

  @Expose()
  probability: number;

  @Expose()
  isActive: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<AdminInventoryEntity>) {
    Object.assign(this, partial);
  }
}
