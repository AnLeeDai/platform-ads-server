import { Expose, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';

import type { AdminInventoryPrizeType } from '../schema/admin.inventory.schema';

export class UpdateAdminInventoryDto {
  @Expose()
  @IsOptional()
  @IsString()
  title?: string;

  @Expose()
  @IsOptional()
  @IsIn(['CASH', 'COUPON', 'POINT'] as AdminInventoryPrizeType[])
  type?: AdminInventoryPrizeType;

  @Expose()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  value?: number;

  @Expose()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  quantity?: number;

  @Expose()
  @IsOptional()
  @ValidateIf((o: UpdateAdminInventoryDto) => o.type === 'COUPON')
  @IsDate()
  @Type(() => Date)
  expiresAt?: Date;

  @Expose()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  probability?: number;

  @Expose()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
