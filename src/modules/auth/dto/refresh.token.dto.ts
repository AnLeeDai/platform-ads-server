import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @Expose()
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}
