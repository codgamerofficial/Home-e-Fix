import { apiClient } from "./client";
import type { Service, ServiceCategory, ServiceFilters } from "@/types/service.types";
import type { PaginatedResponse } from "@/types/common.types";

const SERVICES_BASE = "/services";

export const servicesApi = {
  getCategories: () =>
    apiClient.get<ServiceCategory[]>(`${SERVICES_BASE}/categories`),

  getCategoryBySlug: (slug: string) =>
    apiClient.get<ServiceCategory>(`${SERVICES_BASE}/categories/${slug}`),

  getServices: (filters?: ServiceFilters & { page?: number; pageSize?: number }) =>
    apiClient.get<PaginatedResponse<Service>>(SERVICES_BASE, {
      params: filters as Record<string, string | number | boolean | undefined>,
    }),

  getServiceBySlug: (categorySlug: string, serviceSlug: string) =>
    apiClient.get<Service>(
      `${SERVICES_BASE}/${categorySlug}/${serviceSlug}`
    ),

  getPopularServices: (limit = 8) =>
    apiClient.get<Service[]>(`${SERVICES_BASE}/popular`, {
      params: { limit },
    }),

  getFeaturedServices: (limit = 6) =>
    apiClient.get<Service[]>(`${SERVICES_BASE}/featured`, {
      params: { limit },
    }),

  searchServices: (query: string) =>
    apiClient.get<Service[]>(`${SERVICES_BASE}/search`, {
      params: { q: query },
    }),
};
