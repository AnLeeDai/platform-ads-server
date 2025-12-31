import { Expose } from 'class-transformer';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateAdsDto {
  @Expose()
  @IsOptional()
  @IsString()
  title?: string;

  @Expose()
  @IsOptional()
  @IsString()
  description?: string;

  @Expose()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @Expose()
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @Expose()
  @IsOptional()
  @IsNumber()
  point?: number;

  @Expose()
  @IsOptional()
  @IsNumber()
  duration?: number;
}
