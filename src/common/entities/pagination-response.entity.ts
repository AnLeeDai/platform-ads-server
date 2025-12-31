import { Expose, Type } from 'class-transformer';

export class PaginationMetaEntity {
  @Expose()
  page: number;

  @Expose()
  limit: number;

  @Expose()
  totalItems: number;

  @Expose()
  totalPages: number;

  @Expose()
  hasPreviousPage: boolean;

  @Expose()
  hasNextPage: boolean;

  constructor(partial: Partial<PaginationMetaEntity>) {
    Object.assign(this, partial);
  }
}

export class PaginatedResponseEntity<T> {
  @Expose()
  items: T[];

  @Expose()
  @Type(() => PaginationMetaEntity)
  meta: PaginationMetaEntity;

  constructor(partial: Partial<PaginatedResponseEntity<T>>) {
    Object.assign(this, partial);
  }
}
