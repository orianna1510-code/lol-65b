export type SortOption = "hot" | "new" | "top";

export type VoteDirection = 1 | -1;

export interface PaginationParams {
  cursor?: string;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}
