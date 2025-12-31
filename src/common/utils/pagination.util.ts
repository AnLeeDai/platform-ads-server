import mongoose, { Model, QueryOptions } from 'mongoose';

import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  MAX_LIMIT,
  PaginatedData,
  PaginationMeta,
  PaginationOptions,
} from '../http/response.types';

export function buildPaginationMeta(
  page: number,
  limit: number,
  totalItems: number,
): PaginationMeta {
  const totalPages = Math.ceil(totalItems / limit) || 1;

  return {
    page,
    limit,
    totalItems,
    totalPages,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
  };
}

export function normalizePaginationOptions(
  options: PaginationOptions = {},
): Required<PaginationOptions> {
  const page = Math.max(1, Math.floor(Number(options?.page) || DEFAULT_PAGE));
  const limit = Math.max(
    1,
    Math.min(MAX_LIMIT, Math.floor(Number(options?.limit) || DEFAULT_LIMIT)),
  );

  return { page, limit };
}

export function calculateSkip(page: number, limit: number): number {
  return (page - 1) * limit;
}

export async function paginateQuery<T>(
  model: Model<T>,
  filter: mongoose.QueryFilter<T>,
  paginationOptions: PaginationOptions,
  queryOptions: QueryOptions = {},
  populate?: any,
): Promise<PaginatedData<T>> {
  const { page, limit } = normalizePaginationOptions(paginationOptions);
  const skip = calculateSkip(page, limit);

  const query = model.find(filter, null, { ...queryOptions, skip, limit });

  if (populate) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    query.populate(populate);
  }

  const [items, totalItems] = await Promise.all([
    query.lean().exec(),
    model.countDocuments(filter).exec(),
  ]);

  return {
    items: items as T[],
    meta: buildPaginationMeta(page, limit, totalItems),
  };
}

export function emptyPaginatedData<T>(
  page = DEFAULT_PAGE,
  limit = DEFAULT_LIMIT,
): PaginatedData<T> {
  return {
    items: [],
    meta: buildPaginationMeta(page, limit, 0),
  };
}
