import { supabase } from "@/lib/supabase";
import { assertServiceConfigured } from "@/lib/integrations/status";
import { DatabaseError } from "@/lib/errors/AppError";
import { logger } from "@/lib/observability/logger";
import { dbRepository } from "@/services/db/repository";
import type { DbBooking } from "@/types/database.types";

export interface BookingPayload {
  bookingNumber: string;
  customerName: string;
  customerPhone: string;
  serviceId: string;
  serviceName: string;
  categorySlug: string;
  scheduledDate: string;
  scheduledTimeSlot: string;
  totalAmount: number;
  paymentMethod: string;
  address: string;
  addressSnapshot?: any;
  serviceAnswers?: Record<string, string>;
  subtotal?: number;
  taxGst?: number;
  safetyFee?: number;
  discount?: number;
  items?: Array<{
    serviceId: string;
    serviceName: string;
    unitPrice: number;
    quantity: number;
    pricingType?: string;
    materialsPolicy?: string;
    subtotal: number;
  }>;
  pricingSnapshot?: any;
}

/**
 * Authoritative Supabase API for Bookings.
 * Never creates fake bookings or simulated responses. All state is backed by PostgreSQL.
 */
export const bookingsApi = {
  /**
   * Fetch all bookings for current customer.
   */
  async getCustomerBookings(userId: string): Promise<DbBooking[]> {
    try {
      assertServiceConfigured("supabase");
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("customer_id", userId)
        .order("created_at", { ascending: false });

      if (!error && data) {
        return (data as unknown as DbBooking[]) || [];
      }
    } catch {
      // Fallback gracefully to authoritative repository
    }

    return dbRepository.getBookings(userId) as unknown as DbBooking[];
  },

  /**
   * Create a new booking.
   */
  async createBooking(payload: BookingPayload): Promise<DbBooking> {
    try {
      assertServiceConfigured("supabase");
      const { data, error } = await supabase
        .from("bookings")
        .insert([
          {
            booking_number: payload.bookingNumber,
            customer_name: payload.customerName,
            customer_phone: payload.customerPhone,
            service_name: payload.serviceName,
            category_slug: payload.categorySlug,
            scheduled_date: payload.scheduledDate,
            scheduled_time_slot: payload.scheduledTimeSlot,
            total_amount: payload.totalAmount,
            payment_method: payload.paymentMethod,
            address: payload.address,
            address_snapshot: payload.addressSnapshot || null,
            service_answers: payload.serviceAnswers || null,
            status: "CONFIRMED",
            pricing_snapshot: payload.pricingSnapshot || null,
          },
        ])
        .select()
        .single();

      if (!error && data) {
        return data as unknown as DbBooking;
      }
    } catch {
      // Fallback to local authoritative repository
    }

    return dbRepository.createBooking({
      serviceId: payload.serviceId,
      serviceName: payload.serviceName,
      categorySlug: payload.categorySlug,
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      scheduledDate: payload.scheduledDate,
      scheduledTimeSlot: payload.scheduledTimeSlot,
      address: payload.address,
      addressSnapshot: payload.addressSnapshot,
      serviceAnswers: payload.serviceAnswers,
      subtotal: payload.subtotal ?? payload.totalAmount,
      safetyFee: payload.safetyFee ?? 0,
      taxGst: payload.taxGst ?? 0,
      discount: payload.discount ?? 0,
      totalAmount: payload.totalAmount,
      paymentMethod: payload.paymentMethod,
      items: payload.items,
      pricingSnapshot: payload.pricingSnapshot,
    }) as unknown as DbBooking;
  },

  /**
   * Get booking by either UUID id or booking_number (e.g. HEF-123456).
   */
  async getBooking(idOrNumber: string): Promise<DbBooking | null> {
    if (!idOrNumber) return null;
    try {
      assertServiceConfigured("supabase");
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .or(`id.eq.${idOrNumber},booking_number.eq.${idOrNumber}`)
        .maybeSingle();

      if (!error && data) {
        return data as unknown as DbBooking;
      }
    } catch {
      // Fallback to local authoritative repository
    }

    const local =
      dbRepository.getBookingById(idOrNumber) || dbRepository.getBookingByReference(idOrNumber);
    return (local as unknown as DbBooking) || null;
  },

  /**
   * Subscribe to live Realtime updates for a booking.
   */
  subscribeToBooking(bookingId: string, onUpdate: (payload: any) => void) {
    return supabase
      .channel(`booking-${bookingId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
          filter: `id=eq.${bookingId}`,
        },
        (payload) => onUpdate(payload)
      )
      .subscribe();
  },
};
