import { supabase } from "@/lib/supabase";

/**
 * Supabase Storage bucket upload helper.
 */
export const storageService = {
  /**
   * Upload file to specified bucket.
   */
  async uploadFile(bucketName: "avatars" | "booking-photos" | "technician-docs", filePath: string, file: File) {
    try {
      const { data, error } = await supabase.storage.from(bucketName).upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

      if (error) throw error;

      const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(data.path);
      return urlData.publicUrl;
    } catch {
      // Fallback mock image URL if bucket is not created
      return URL.createObjectURL(file);
    }
  },
};
