/**
 * Home-e-Fix Serverless Internal Event Analytics Service
 * Zero external paid SaaS dependencies (no Segment, Amplitude, Mixpanel, or GA4 required).
 * Handles persistent in-app telemetry, conversion funnels, and marketing metrics.
 */

export type AnalyticsEventName =
  | "page_view"
  | "service_view"
  | "search"
  | "service_filter"
  | "booking_started"
  | "booking_slot_selected"
  | "booking_address_selected"
  | "booking_payment_selected"
  | "booking_confirmed"
  | "booking_cancelled"
  | "review_submitted"
  | "warranty_claim_started";

export interface AnalyticsEvent {
  id: string;
  eventName: AnalyticsEventName;
  properties: Record<string, any>;
  timestamp: string; // ISO
  sessionId: string;
  userId?: string;
}

const STORAGE_KEY = "homeefix_analytics_events";
const SESSION_KEY = "homeefix_analytics_session_id";
const MAX_EVENTS = 500;

function getSessionId(): string {
  if (typeof window === "undefined") return "session-srv";
  try {
    let sid = sessionStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = `ses-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      sessionStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    return "session-fallback";
  }
}

class AnalyticsService {
  private inMemoryEvents: AnalyticsEvent[] = [];

  private getStoredEvents(): AnalyticsEvent[] {
    if (typeof window === "undefined" || typeof localStorage === "undefined") {
      return this.inMemoryEvents;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : this.inMemoryEvents;
    } catch {
      return this.inMemoryEvents;
    }
  }

  private saveEvents(events: AnalyticsEvent[]): void {
    this.inMemoryEvents = events.slice(0, MAX_EVENTS);
    if (typeof window === "undefined" || typeof localStorage === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.inMemoryEvents));
    } catch (e) {
      console.warn("[Home-e-Fix Analytics] Storage write failed:", e);
    }
  }

  /**
   * Track an application event with optional context metadata
   */
  public trackEvent(eventName: AnalyticsEventName, properties: Record<string, any> = {}): void {
    const event: AnalyticsEvent = {
      id: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      eventName,
      properties: {
        ...properties,
        url: typeof window !== "undefined" ? window.location.pathname : "",
        referrer: typeof document !== "undefined" ? document.referrer : "",
      },
      timestamp: new Date().toISOString(),
      sessionId: getSessionId(),
      userId: properties.userId || properties.customerId,
    };

    try {
      if (typeof import.meta !== "undefined" && (import.meta as any).env?.DEV) {
        console.log(`[Analytics] 📊 ${eventName}`, properties);
      }
    } catch {
      // Safe no-op
    }

    const events = this.getStoredEvents();
    events.unshift(event);
    this.saveEvents(events);
  }

  /**
   * Retrieve list of recent telemetry events
   */
  public getRecentEvents(limit: number = 50): AnalyticsEvent[] {
    return this.getStoredEvents().slice(0, limit);
  }

  /**
   * Calculate summary count by event type
   */
  public getEventSummary(): Record<string, number> {
    const events = this.getStoredEvents();
    const summary: Record<string, number> = {};
    events.forEach((ev) => {
      summary[ev.eventName] = (summary[ev.eventName] || 0) + 1;
    });
    return summary;
  }

  /**
   * Calculate conversion funnel metrics
   */
  public getFunnelMetrics(): {
    pageViews: number;
    serviceViews: number;
    searches: number;
    bookingStarts: number;
    bookingsConfirmed: number;
    conversionRate: string;
  } {
    const summary = this.getEventSummary();
    const pageViews = summary["page_view"] || 0;
    const serviceViews = summary["service_view"] || 0;
    const searches = summary["search"] || 0;
    const bookingStarts = summary["booking_started"] || 0;
    const bookingsConfirmed = summary["booking_confirmed"] || 0;

    const rate =
      bookingStarts > 0
        ? `${((bookingsConfirmed / bookingStarts) * 100).toFixed(1)}%`
        : "0.0%";

    return {
      pageViews,
      serviceViews,
      searches,
      bookingStarts,
      bookingsConfirmed,
      conversionRate: rate,
    };
  }

  /**
   * Clear telemetry store (for testing or reset)
   */
  public clearEvents(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}

export const analyticsService = new AnalyticsService();
