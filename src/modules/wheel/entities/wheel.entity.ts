import { Expose, Type } from 'class-transformer';

import { AdminInventoryEntity } from 'src/modules/admin-inventory/entities/admin.inventory.entity';

export class WheelSpinResultEntity {
  @Expose()
  result: 'WIN' | 'LOSE';

  @Expose()
  message: string;

  @Expose()
  @Type(() => AdminInventoryEntity)
  prize?: AdminInventoryEntity;

  @Expose()
  awardedPoints?: number;

  constructor(partial: Partial<WheelSpinResultEntity>) {
    Object.assign(this, partial);
  }
}
