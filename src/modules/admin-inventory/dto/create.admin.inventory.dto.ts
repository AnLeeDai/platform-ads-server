import { Expose, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';

import type { AdminInventoryPrizeType } from '../schema/admin.inventory.schema';

export class CreateAdminInventoryDto {
  @Expose()
  @IsNotEmpty()
  @IsString()
  title: string;

  @Expose()
  @IsNotEmpty()
  @IsIn(['CASH', 'COUPON', 'POINT'] as AdminInventoryPrizeType[])
  type: AdminInventoryPrizeType;

  @Expose()
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  value: number;

  @Expose()
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  quantity: number;
  @Expose()
  @ValidateIf((o: CreateAdminInventoryDto) => o.type === 'COUPON')
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  expiresAt?: Date;

  @Expose()
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  probability: number;

  @Expose()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
