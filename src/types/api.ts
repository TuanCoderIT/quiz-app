// ─── Generic API Response ────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// ─── Validation Error (Laravel 422) ─────────────────────────────────────────
export interface ValidationError {
  message: string;
  errors: Record<string, string[]>;
}

// ─── Pagination Meta ─────────────────────────────────────────────────────────
export interface PaginationMeta {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
