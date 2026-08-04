import { useState } from "react";
import { Link } from "react-router";
import { Clock, Download, XCircle, Calendar, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookingCard } from "@/components/ui/booking-card";
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

  const filteredBookings = MOCK_BOOKINGS.filter((b) => {
    if (filterTab === "upcoming") return b.status === "assigned" || b.status === "confirmed" || b.status === "pending";
    if (filterTab === "completed") return b.status === "completed";
    if (filterTab === "cancelled") return b.status === "cancelled";
    return true;
  });

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
              onCancel={(b) => alert(`Cancelled booking ${b.bookingNumber}`)}
              onReschedule={(b) => alert(`Rescheduling booking ${b.bookingNumber}`)}
              onTrack={(b) => alert(`Tracking live position for ${b.bookingNumber}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
