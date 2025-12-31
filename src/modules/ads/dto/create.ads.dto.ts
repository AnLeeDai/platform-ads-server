import { Expose } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAdsDto {
  @Expose()
  @IsNotEmpty()
  title: string;

  @Expose()
  @IsNotEmpty()
  description: string;

  @Expose()
  @IsOptional()
  imageUrl: string;

  @Expose()
  @IsOptional()
  videoUrl: string;

  @Expose()
  @IsNotEmpty()
  point: number;

  @Expose()
  @IsNotEmpty()
  duration: number;
}
