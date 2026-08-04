import { supabase } from "@/lib/supabase";
import { SERVICE_CATEGORIES } from "@/constants/services";

/**
 * Service catalogue Supabase DB query layer.
 */
export const servicesApi = {
  /**
   * Fetch categories from DB with fallback to SERVICE_CATEGORIES mock constants.
   */
  async getCategories() {
    try {
      const { data, error } = await supabase.from("categories").select("*");
      if (error || !data || data.length === 0) return SERVICE_CATEGORIES;
      return data;
    } catch {
      return SERVICE_CATEGORIES;
    }
  },

  /**
   * Fetch category detail by slug.
   */
  async getCategoryBySlug(slug: string) {
    const categories = await this.getCategories();
    return categories.find((c: any) => c.slug === slug) || null;
  },
};
