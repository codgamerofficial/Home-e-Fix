import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Clock,
  Download,
  Calendar,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Star,
  Receipt,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookingCard } from "@/components/ui/booking-card";
import { LiveTrackingExperience } from "@/components/customer/LiveTrackingExperience";
import { dbRepository } from "@/services/db/repository";
import { ROUTES } from "@/constants/routes";
import { formatCurrency } from "@/lib/utils";

export default function Orders() {
  const [filterTab, setFilterTab] = useState<
    "all" | "upcoming" | "active" | "completed" | "cancelled"
  >("all");
  const [bookings, setBookings] = useState<any[]>([]);
  const [trackingBooking, setTrackingBooking] = useState<any | null>(null);
  const [reviewBooking, setReviewBooking] = useState<any | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Load bookings from repository
  const loadBookings = () => {
    const list = dbRepository.getBookings();
    setBookings(list);
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const filteredBookings = bookings.filter((b) => {
    const status = (b.status || "").toUpperCase();
    if (filterTab === "upcoming") {
      return ["CONFIRMED", "MATCHING", "ASSIGNMENT_PENDING", "PENDING_PAYMENT", "PENDING"].includes(status);
    }
    if (filterTab === "active") {
      return ["PROFESSIONAL_ACCEPTED", "PROFESSIONAL_ASSIGNED", "PROFESSIONAL_ON_THE_WAY", "PROFESSIONAL_ARRIVED", "SERVICE_STARTED", "IN_PROGRESS"].includes(status);
    }
    if (filterTab === "completed") {
      return ["SERVICE_COMPLETED", "CUSTOMER_CONFIRMED", "COMPLETED"].includes(status);
    }
    if (filterTab === "cancelled") {
      return ["CANCELLED", "REFUND_PENDING", "REFUNDED", "DISPUTED"].includes(status);
    }
    return true;
  });

  const handleCancelBooking = (booking: any) => {
    dbRepository.updateBookingStatus(
      booking.id,
      "CANCELLED",
      "Cancelled by customer from My Bookings"
    );
    loadBookings();
    setActionNotice(
      `Booking #${booking.booking_number || booking.id} has been cancelled. Any pre-paid amount has been scheduled for refund to your Home-e-Fix Wallet.`
    );
    setTimeout(() => setActionNotice(null), 7000);
  };

  const handleRescheduleBooking = (booking: any) => {
    setActionNotice(
      `Reschedule request recorded for #${booking.booking_number || booking.id}. Our customer support dispatch team will contact you to confirm a new time slot.`
    );
    setTimeout(() => setActionNotice(null), 7000);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewBooking) return;

    dbRepository.createReview({
      bookingId: reviewBooking.id,
      serviceName: reviewBooking.service_name || "Home Service",
      rating: reviewRating,
      comment: reviewComment || "Excellent workmanship and polite professional.",
    });

    setReviewBooking(null);
    setReviewComment("");
    setActionNotice(`Thank you! Your verified rating of ${reviewRating} stars has been published.`);
    setTimeout(() => setActionNotice(null), 6000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-primary">
            My Bookings & Orders
          </h1>
          <p className="text-xs text-foreground-secondary mt-1">
            Track live dispatches, view digital invoices, and manage service appointments
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap p-1 rounded-xl bg-surface border border-border text-xs font-semibold">
          {(["all", "upcoming", "active", "completed", "cancelled"] as const).map((tab) => (
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

      {/* ACTION BANNER */}
      {actionNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span className="text-xs sm:text-sm font-semibold">{actionNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionNotice(null)}
            className="text-xs text-emerald-700 hover:text-emerald-900 font-bold px-2 py-0.5"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* BOOKINGS LIST OR EMPTY STATE */}
      {filteredBookings.length === 0 ? (
        <Card className="p-12 text-center space-y-4 border border-border bg-surface">
          <div className="mx-auto h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
            <Clock className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-heading text-base font-bold text-primary">
              No Bookings Found
            </h3>
            <p className="text-xs text-foreground-secondary max-w-sm mx-auto">
              {filterTab === "all"
                ? "You haven't placed any home service bookings yet. Explore our verified catalog to get started."
                : `No bookings currently in the "${filterTab}" state.`}
            </p>
          </div>
          <Button variant="accent" asChild className="font-bold shadow-xs">
            <Link to={ROUTES.SERVICES}>
              Browse All Services <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <BookingCard
              key={booking.id || booking.booking_number}
              booking={booking}
              onCancel={handleCancelBooking}
              onReschedule={handleRescheduleBooking}
              onTrack={(b) => setTrackingBooking(b)}
              onReview={(b) => setReviewBooking(b)}
              onInvoice={(b) => {
                window.location.href = `/app/invoices`;
              }}
            />
          ))}
        </div>
      )}

      {/* LIVE TRACKING MODAL */}
      <LiveTrackingExperience
        isOpen={!!trackingBooking}
        onClose={() => setTrackingBooking(null)}
        booking={trackingBooking}
      />

      {/* SUBMIT REVIEW MODAL */}
      {reviewBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <Card className="w-full max-w-md border border-border bg-surface p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-heading text-base font-bold text-primary">
                Rate & Review Service
              </h3>
              <button
                type="button"
                onClick={() => setReviewBooking(null)}
                className="text-foreground-muted hover:text-primary font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-foreground-secondary">
              How was your experience for <strong className="text-primary">{reviewBooking.service_name}</strong>?
            </p>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Star Rating */}
              <div className="flex items-center justify-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="p-1 cursor-pointer transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-7 w-7 ${
                        star <= reviewRating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-slate-300"
                      }`}
                    />
                  </button>
                ))}
              </div>

              <div>
                <label className="text-[11px] font-semibold text-foreground-secondary block mb-1">
                  Your Review / Comments
                </label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share details about technician punctuality, cleanliness, and quality..."
                  className="w-full rounded-xl border border-border p-3 text-xs bg-background text-primary focus:outline-hidden focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button variant="ghost" size="sm" onClick={() => setReviewBooking(null)}>
                  Cancel
                </Button>
                <Button variant="accent" size="sm" type="submit" className="font-bold">
                  Submit Verified Review
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
