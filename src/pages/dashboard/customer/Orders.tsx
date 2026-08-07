import { useState } from "react";
import { Link } from "react-router";
import { Clock, Download, XCircle, Calendar, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookingCard } from "@/components/ui/booking-card";
import { LiveTrackingModal } from "@/components/ui/live-tracking-modal";
import { formatCurrency } from "@/lib/utils";

const MOCK_BOOKINGS: any[] = [
  {
    id: "b-1",
    bookingNumber: "HEF-894102",
    status: "assigned",
    serviceName: "Split AC Foam Jet Deep Servicing",
    categoryName: "AC Repair & Service",
    scheduledDate: "Tomorrow, Aug 05",
    scheduledTimeSlot: "10:00 AM - 11:00 AM",
    totalAmount: 528,
    paymentStatus: "pending",
    technicianName: "Suresh Reddy",
    technicianAvatar: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&q=80",
    technicianPhone: "+91 98765 43210",
  },
  {
    id: "b-2",
    bookingNumber: "HEF-710294",
    status: "completed",
    serviceName: "Bathroom Leakage & Tap Repair",
    categoryName: "Plumbing",
    scheduledDate: "Jul 28, 2026",
    scheduledTimeSlot: "02:00 PM - 03:00 PM",
    totalAmount: 228,
    paymentStatus: "paid",
    technicianName: "Mahesh Kumar",
    technicianAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80",
  },
  {
    id: "b-3",
    bookingNumber: "HEF-659103",
    status: "cancelled",
    serviceName: "Switch & MCB Installation",
    categoryName: "Electrical",
    scheduledDate: "Jul 15, 2026",
    scheduledTimeSlot: "11:00 AM - 12:00 PM",
    totalAmount: 178,
    paymentStatus: "refunded",
  },
];

export default function Orders() {
  const [filterTab, setFilterTab] = useState<"all" | "upcoming" | "completed" | "cancelled">("all");
  const [trackingBooking, setTrackingBooking] = useState<any | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const filteredBookings = MOCK_BOOKINGS.filter((b) => {
    if (filterTab === "upcoming") return b.status === "assigned" || b.status === "confirmed" || b.status === "pending";
    if (filterTab === "completed") return b.status === "completed";
    if (filterTab === "cancelled") return b.status === "cancelled";
    return true;
  });

  const handleCancelBooking = (booking: any) => {
    setActionNotice(`Booking #${booking.bookingNumber || booking.id} has been cancelled. Refund initiated to Home-e-Fix Wallet.`);
    setTimeout(() => setActionNotice(null), 6000);
  };

  const handleRescheduleBooking = (booking: any) => {
    setActionNotice(`Reschedule request submitted for #${booking.bookingNumber || booking.id}. Support team will call you within 15 mins.`);
    setTimeout(() => setActionNotice(null), 6000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-primary">My Bookings & Orders</h1>
          <p className="text-xs text-foreground-secondary mt-1">
            Track live technician dispatches, view invoices, or reschedule appointments
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex p-1 rounded-xl bg-surface border border-border text-xs font-semibold">
          {(["all", "upcoming", "completed", "cancelled"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilterTab(tab)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                filterTab === tab
                  ? "bg-primary text-white shadow-xs"
                  : "text-foreground-secondary hover:text-primary"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ACTION TOAST BANNER */}
      {actionNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
            <span className="text-xs sm:text-sm font-semibold">{actionNotice}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-bold px-2 py-0.5"
          >
            Dismiss
          </button>
        </div>
      )}

      {filteredBookings.length === 0 ? (
        <Card className="p-12 text-center space-y-3 border border-border">
          <Clock className="mx-auto h-10 w-10 text-foreground-muted" />
          <h3 className="font-heading text-base font-semibold text-primary">No bookings found</h3>
          <p className="text-xs text-foreground-secondary">No orders match your selected filter.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancel={handleCancelBooking}
              onReschedule={handleRescheduleBooking}
              onTrack={(b) => setTrackingBooking(b)}
            />
          ))}
        </div>
      )}

      {/* LIVE GPS TRACKING MODAL */}
      <LiveTrackingModal
        isOpen={!!trackingBooking}
        onClose={() => setTrackingBooking(null)}
        bookingRef={trackingBooking?.bookingNumber || "HEF-894102"}
        serviceName={trackingBooking?.serviceName || "AC Servicing"}
        technicianName={trackingBooking?.technicianName || "Suresh Reddy"}
        technicianPhone={trackingBooking?.technicianPhone || "+91 98300 12345"}
      />
    </div>
  );
}
