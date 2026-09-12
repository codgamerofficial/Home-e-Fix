import { supabase } from "@/lib/supabase";
import { assertServiceConfigured } from "@/lib/integrations/status";
import { DatabaseError } from "@/lib/errors/AppError";
import { logger } from "@/lib/observability/logger";
import type { DbServiceCategory, DbService } from "@/types/database.types";

/**
 * Authoritative Supabase Service Catalogue API.
 * Queries PostgreSQL service_categories and services tables.
 */
export const servicesApi = {
  /**
   * Fetch all active service categories from database.
   */
  async getCategories(): Promise<DbServiceCategory[]> {
    assertServiceConfigured("supabase");

    const { data, error } = await supabase
      .from("service_categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      logger.error("Failed to query service_categories from database", error);
      throw new DatabaseError(`Could not fetch service categories: ${error.message}`, error);
    }

    return (data as unknown as DbServiceCategory[]) || [];
  },

  /**
   * Fetch category detail by slug.
   */
  async getCategoryBySlug(slug: string): Promise<DbServiceCategory | null> {
    assertServiceConfigured("supabase");

    const { data, error } = await supabase
      .from("service_categories")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      logger.error("Failed to query service category by slug", error, { slug });
      throw new DatabaseError(`Could not fetch category "${slug}": ${error.message}`, error);
    }

    return (data as unknown as DbServiceCategory) || null;
  },

  /**
   * Fetch all services belonging to a specific category.
   */
  async getServicesByCategory(categoryId: string): Promise<DbService[]> {
    assertServiceConfigured("supabase");

    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("category_id", categoryId)
      .eq("is_active", true);

    if (error) {
      logger.error("Failed to query services for category", error, { categoryId });
      throw new DatabaseError(`Could not fetch services: ${error.message}`, error);
    }

    return (data as unknown as DbService[]) || [];
  },
};
