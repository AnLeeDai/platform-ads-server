// ============ Pagination Types ============
export interface PaginationMeta {
  /** Trang hiện tại */
  page: number;
  /** Số item mỗi trang */
  limit: number;
  /** Tổng số item */
  totalItems: number;
  /** Tổng số trang */
  totalPages: number;
  /** Có trang trước không */
  hasPreviousPage: boolean;
  /** Có trang sau không */
  hasNextPage: boolean;
}

export interface PaginatedData<T> {
  items: T[];
  meta: PaginationMeta;
}

// ============ Pagination Input ============
export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

// ============ Response Types ============
export type ApiSuccessResponse<T> = {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
};

export type ApiErrorResponse = {
  success: false;
  statusCode: number;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
  path: string;
};

// ============ Response Keys (for interceptor) ============
export const RESPONSE_MESSAGE_KEY = 'response_message';
export const SKIP_TRANSFORM_KEY = 'skip_transform';
