import { Expose, Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePointDto {
  @Expose()
  @IsNotEmpty()
  @IsString()
  userId: string;

  @Expose()
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  points: number;

  @Expose()
  @IsNotEmpty()
  @IsString()
  description: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  type: string;
}
