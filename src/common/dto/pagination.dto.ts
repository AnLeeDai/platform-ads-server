import { Expose, Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } from '../http/response.types';

export class PaginationQueryDto {
  @Expose()
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = DEFAULT_PAGE;

  @Expose()
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(MAX_LIMIT, { message: `Limit must not exceed ${MAX_LIMIT}` })
  limit?: number = DEFAULT_LIMIT;
}
