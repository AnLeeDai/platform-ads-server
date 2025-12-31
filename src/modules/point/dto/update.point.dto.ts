import { Expose, Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, IsEnum } from 'class-validator';
import type { EnumPointType } from '../schema/point.schema';

export class AdjustPointDto {
  @Expose()
  @IsNotEmpty()
  @IsString()
  userId: string;

  @Expose()
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  amount: number;

  @Expose()
  @IsNotEmpty()
  @IsString()
  description: string;

  @Expose()
  @IsNotEmpty()
  @IsEnum(['WHEEL', 'SPEND', 'ADMIN-ADJUST', 'ADMIN-BONUS'])
  type: EnumPointType;
}
