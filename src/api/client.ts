import type { ApiError, ApiResponse } from "@/types/common.types";
import { useAuthStore } from "@/store/auth.store";

/* ─── Configuration ─── */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
}

/* ─── API Client ─── */

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Build URL with query parameters.
   */
  private buildUrl(
    path: string,
    params?: Record<string, string | number | boolean | undefined>
  ): string {
    const url = new URL(`${this.baseUrl}${path}`, window.location.origin);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      });
    }
    return url.toString();
  }

  /**
   * Get authorization headers.
   */
  private getAuthHeaders(): Record<string, string> {
    const token = useAuthStore.getState().accessToken;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * Make a typed API request.
   */
  private async request<T>(
    method: HttpMethod,
    path: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(path, options?.params);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...this.getAuthHeaders(),
      ...options?.headers,
    };

    const config: RequestInit = {
      method,
      headers,
      signal: options?.signal,
    };

    if (body && method !== "GET") {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const apiError: ApiError = {
          code: errorData?.code || "UNKNOWN_ERROR",
          message: errorData?.message || `HTTP ${response.status}: ${response.statusText}`,
          details: errorData?.details,
          statusCode: response.status,
        };

        // Handle 401 — auto-logout
        if (response.status === 401) {
          useAuthStore.getState().logout();
        }

        throw apiError;
      }

      const data = await response.json();
      return data as ApiResponse<T>;
    } catch (error) {
      if ((error as ApiError).statusCode) {
        throw error;
      }

      // Network error
      throw {
        code: "NETWORK_ERROR",
        message: "Unable to connect. Please check your internet connection.",
        statusCode: 0,
      } as ApiError;
    }
  }

  /* ─── Public Methods ─── */

  async get<T>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>("GET", path, undefined, options);
  }

  async post<T>(
    path: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>("POST", path, body, options);
  }

  async put<T>(
    path: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>("PUT", path, body, options);
  }

  async patch<T>(
    path: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>("PATCH", path, body, options);
  }

  async delete<T>(
    path: string,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>("DELETE", path, undefined, options);
  }
}

/**
 * Singleton API client instance.
 */
export const apiClient = new ApiClient(BASE_URL);
