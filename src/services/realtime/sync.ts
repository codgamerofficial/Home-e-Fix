/**
 * HOME-E-FIX: REALTIME MARKETPLACE SYNCHRONIZATION ENGINE
 *
 * Provides resilient, multi-transport synchronization connecting:
 * - Customer App (Booking & Tracking)
 * - Professional Panel (Jobs, Offers & Status)
 * - Admin Control Center (Live Operations & Assignment Queue)
 *
 * Transports:
 * 1. HTML5 BroadcastChannel (zero-latency cross-tab communication)
 * 2. DOM CustomEvents (same-window reactive updates)
 * 3. LocalStorage storage event (cross-tab fallback)
 * 4. Supabase Realtime Channels (network-wide broadcast / postgres_changes)
 */

import { supabase } from "@/lib/supabase";

export interface BookingSyncEvent {
  bookingId: string;
  bookingNumber?: string;
  eventType: string;
  status: string;
  timestamp: string;
  data?: any;
}

// In-memory listeners (guarantees synchronous same-process / Node.js test environment reactivity)
const inMemoryListeners = new Set<{
  target: string;
  cb: (ev: BookingSyncEvent) => void;
}>();

// Global broadcast channel instance across tabs
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    broadcastChannel = new BroadcastChannel("homeefix_marketplace_sync");
  }
} catch {
  broadcastChannel = null;
}

/**
 * Broadcast a booking lifecycle event across all panels and tabs.
 */
export function broadcastBookingEvent(
  bookingId: string,
  status: string,
  data?: any,
  bookingNumber?: string
): void {
  const payload: BookingSyncEvent = {
    bookingId,
    bookingNumber,
    eventType: status,
    status,
    timestamp: new Date().toISOString(),
    data,
  };

  // 1. In-memory listeners (immediate same-process notification)
  inMemoryListeners.forEach(({ target, cb }) => {
    if (target === "*" || target === bookingId || target === bookingNumber) {
      try {
        cb(payload);
      } catch {
        // Non-blocking
      }
    }
  });

  // 2. Cross-tab BroadcastChannel
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage(payload);
    } catch (e) {
      // Non-blocking
    }
  }

  // 3. Same-window DOM event
  if (typeof window !== "undefined") {
    try {
      window.dispatchEvent(
        new CustomEvent("homeefix:booking_updated", { detail: payload })
      );
    } catch {
      // Non-blocking
    }
  }

  // 4. Supabase Realtime Broadcast (Network / Browser)
  if (typeof window !== "undefined") {
    try {
      const channel = supabase.channel(`booking:${bookingId}:events`);
      channel.send({
        type: "broadcast",
        event: "status_changed",
        payload,
      });
    } catch {
      // Non-blocking if offline
    }
  }
}

/**
 * Subscribe to booking updates for a specific booking or globally ("*").
 * Returns an unsubscribe cleanup function.
 */
export function subscribeToBookingSync(
  bookingIdOrWildcard: string,
  callback: (event: BookingSyncEvent) => void
): () => void {
  const isWildcard = bookingIdOrWildcard === "*";

  // Register in-memory listener
  const memListener = { target: bookingIdOrWildcard, cb: callback };
  inMemoryListeners.add(memListener);

  // Handler for BroadcastChannel
  const handleBcMessage = (ev: MessageEvent) => {
    const msg = ev.data as BookingSyncEvent;
    if (!msg || !msg.bookingId) return;
    if (isWildcard || msg.bookingId === bookingIdOrWildcard || msg.bookingNumber === bookingIdOrWildcard) {
      callback(msg);
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener("message", handleBcMessage);
  }

  // Handler for Window CustomEvent
  const handleDomEvent = (ev: Event) => {
    const customEv = ev as CustomEvent<BookingSyncEvent>;
    const msg = customEv.detail;
    if (!msg || !msg.bookingId) return;
    if (isWildcard || msg.bookingId === bookingIdOrWildcard || msg.bookingNumber === bookingIdOrWildcard) {
      callback(msg);
    }
  };

  // Handler for Storage Event (cross-tab fallback)
  const handleStorageEvent = (ev: StorageEvent) => {
    if (ev.key === "homeefix_bookings" || ev.key === "homeefix_assignments") {
      callback({
        bookingId: bookingIdOrWildcard,
        eventType: "STORAGE_UPDATED",
        status: "SYNC",
        timestamp: new Date().toISOString(),
      });
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("homeefix:booking_updated", handleDomEvent);
    window.addEventListener("storage", handleStorageEvent);
  }

  // Supabase Realtime channel subscription (only active in real browser runtime)
  let supabaseChannel: any = null;
  if (!isWildcard && typeof window !== "undefined") {
    try {
      supabaseChannel = supabase
        .channel(`booking:${bookingIdOrWildcard}:events`)
        .on("broadcast", { event: "status_changed" }, (res: any) => {
          if (res?.payload) callback(res.payload);
        })
        .subscribe();
    } catch {
      // Non-blocking
    }
  }

  return () => {
    inMemoryListeners.delete(memListener);
    if (broadcastChannel) {
      broadcastChannel.removeEventListener("message", handleBcMessage);
    }
    if (typeof window !== "undefined") {
      window.removeEventListener("homeefix:booking_updated", handleDomEvent);
      window.removeEventListener("storage", handleStorageEvent);
    }
    if (supabaseChannel && typeof window !== "undefined") {
      supabase.removeChannel(supabaseChannel);
    }
  };
}
