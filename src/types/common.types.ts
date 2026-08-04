/* ─── API Response Types ─── */

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
  statusCode: number;
}

/* ─── Geolocation ─── */

export interface GeoLocation {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

/* ─── Date & Time ─── */

export interface TimeSlot {
  id: string;
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
  isAvailable: boolean;
}

export interface DateRange {
  startDate: string; // ISO 8601
  endDate: string; // ISO 8601
}

/* ─── Media ─── */

export interface MediaFile {
  id: string;
  url: string;
  type: "image" | "video" | "document";
  name: string;
  size: number;
  mimeType: string;
}

/* ─── Sorting & Filtering ─── */

export type SortDirection = "asc" | "desc";

export interface SortOption {
  field: string;
  direction: SortDirection;
}

export interface FilterOption {
  field: string;
  operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "contains";
  value: string | number | boolean | string[];
}

export interface QueryParams {
  page?: number;
  pageSize?: number;
  sort?: SortOption;
  filters?: FilterOption[];
  search?: string;
}

/* ─── UI State ─── */

export type LoadingState = "idle" | "loading" | "success" | "error";

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
  icon?: string;
}

/* ─── Generic Entity ─── */

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}
