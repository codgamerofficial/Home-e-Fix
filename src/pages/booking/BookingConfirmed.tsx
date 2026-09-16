import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  Phone,
  ShieldCheck,
  Download,
  ArrowRight,
  Home,
  UserCheck,
  AlertCircle,
  Sparkles,
  Navigation,
  FileText,
  CreditCard,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/constants/routes";
import { formatCurrency } from "@/lib/currency";
import { useBookingConfirmation } from "@/hooks/useBookingConfirmation";
import { useNotificationStore } from "@/store/notification.store";
import { InvoiceModal } from "@/components/booking/InvoiceModal";

export default function BookingConfirmed() {
  const { bookingId = "" } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  const {
    data: confirmation,
    isLoading,
    isError,
    error,
    refetch,
  } = useBookingConfirmation(bookingId);

  // Dispatch in-app notification once when booking loads
  useEffect(() => {
    if (confirmation?.bookingNumber) {
      const existing = useNotificationStore
        .getState()
        .notifications.some((n) => n.message?.includes(confirmation.bookingNumber));

      if (!existing) {
        useNotificationStore.getState().addNotification({
          type: "success",
          title: "Booking Confirmed",
          message: `Your Home-e-Fix booking ${confirmation.bookingNumber} is confirmed for ${confirmation.scheduled.date}.`,
          link: `/booking/confirmation/${confirmation.bookingNumber}`,
        });
      }
    }
  }, [confirmation?.bookingNumber, confirmation?.scheduled.date]);

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 px-4 bg-background">
        <div className="h-12 w-12 rounded-full border-3 border-accent border-t-transparent animate-spin" />
        <p className="font-heading text-sm font-semibold text-primary">
          Loading your booking details...
        </p>
      </div>
    );
  }

  // Error / Not Found State
  if (isError || !confirmation) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 px-4 text-center bg-background">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h2 className="font-heading text-xl font-bold text-primary">Booking Not Found</h2>
          <p className="text-xs text-foreground-secondary max-w-md">
            {error instanceof Error ? error.message : "We couldn't retrieve the details for this booking ID."}
          </p>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>
            Retry
          </Button>
          <Button variant="accent" size="sm" asChild>
            <Link to={ROUTES.HOME}>
              <Home className="mr-1.5 h-3.5 w-3.5" /> Back to Home
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Access Control / Unauthorized
  if (!confirmation.canViewBooking) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 px-4 text-center bg-background">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h2 className="font-heading text-xl font-bold text-primary">Access Restricted</h2>
          <p className="text-xs text-foreground-secondary max-w-md">
            {confirmation.unauthorizedReason || "You don't have access to this booking."}
          </p>
        </div>
        <Button variant="accent" size="sm" asChild>
          <Link to={ROUTES.CUSTOMER_BOOKINGS}>View My Bookings</Link>
        </Button>
      </div>
    );
  }

  const {
    booking,
    bookingNumber,
    status,
    service,
    customer,
    addressSnapshot,
    scheduled,
    payment,
    professional,
    warranty,
    timeline,
  } = confirmation;

  // Canonical Tracking URL
  const trackingUrl = `/bookings/${booking.id || bookingNumber}/track`;

  return (
    <div className="min-h-screen bg-background py-8 sm:py-14 pb-28 md:pb-14">
      <div className="container-app max-w-6xl space-y-8">
        {/* ─── HERO CELEBRATION HEADER ─── */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-center space-y-3"
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-md ring-8 ring-emerald-50">
            <CheckCircle className="h-10 w-10" />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" /> Service Successfully Booked
            </div>
            <h1 className="font-heading text-2xl sm:text-4xl font-extrabold text-primary">
              Booking Confirmed!
            </h1>
            <p className="text-xs sm:text-sm text-foreground-secondary">
              Your service request has been scheduled with verified professionals.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <span className="text-xs font-medium text-foreground-muted">Booking Reference:</span>
            <span className="font-mono text-xs font-bold text-accent px-2 py-0.5 rounded-md bg-accent/10">
              {bookingNumber}
            </span>
            <Badge
              variant="outline"
              className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border-emerald-300"
            >
              {status}
            </Badge>
          </div>
        </motion.div>

        {/* ─── PRIMARY ACTIONS BAR (DESKTOP & TABLET) ─── */}
        <div className="hidden sm:flex items-center justify-center gap-4 py-2">
          <Button
            variant="accent"
            size="lg"
            onClick={() => navigate(trackingUrl)}
            className="min-w-48 font-bold bg-[#FF6A00] hover:bg-[#E55F00] text-white shadow-lg shadow-orange-500/20 text-sm gap-2"
          >
            <Navigation className="h-4 w-4" /> Track Booking <ArrowRight className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => setIsInvoiceOpen(true)}
            className="min-w-44 font-semibold text-sm gap-2 border-border/80 hover:bg-surface"
          >
            <Download className="h-4 w-4 text-accent" /> Download PDF Invoice
          </Button>

          <Button
            variant="ghost"
            size="lg"
            asChild
            className="text-foreground-secondary hover:text-primary text-sm"
          >
            <Link to={ROUTES.HOME}>
              <Home className="mr-1.5 h-4 w-4" /> Back to Home
            </Link>
          </Button>
        </div>

        {/* ─── MAIN CONTENT GRID (2 COLUMNS ON DESKTOP, 1 ON MOBILE) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ════════ LEFT COLUMN: BOOKING DETAILS & TIMELINE (7 COLS) ════════ */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Booking Summary Card */}
            <Card className="p-5 sm:p-7 border border-border/90 shadow-sm bg-surface rounded-2xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <span className="text-[11px] font-bold uppercase tracking-wider text-foreground-muted">
                  Booking Summary
                </span>
                <span className="text-xs font-semibold text-accent capitalize">
                  {service.categorySlug}
                </span>
              </div>

              {/* Service Package */}
              <div className="space-y-1">
                <h3 className="font-heading text-lg sm:text-xl font-bold text-primary">
                  {service.name}
                </h3>
                <p className="text-xs text-foreground-secondary">
                  Complete professional doorstep home service with verified equipment
                </p>
              </div>

              {/* Scheduled Time & Arrival */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-accent/5 border border-accent/20">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-accent/15 text-accent flex items-center justify-center shrink-0 mt-0.5">
                    <Calendar className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-primary uppercase tracking-wide">
                      Scheduled Date
                    </div>
                    <div className="text-xs font-semibold text-primary mt-0.5">
                      {scheduled.date}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-accent/15 text-accent flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-primary uppercase tracking-wide">
                      Arrival Window
                    </div>
                    <div className="text-xs font-semibold text-primary mt-0.5">
                      {scheduled.timeSlot}
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Address Snapshot */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                  <MapPin className="h-4 w-4 text-[#FF6A00]" /> Service Location
                </div>
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 text-xs text-foreground-secondary space-y-1">
                  <p className="font-semibold text-primary">{customer.name}</p>
                  <p>
                    {addressSnapshot.houseFlatFloor && `${addressSnapshot.houseFlatFloor}, `}
                    {addressSnapshot.buildingSocietyName && `${addressSnapshot.buildingSocietyName}, `}
                    {addressSnapshot.streetRoadName}
                  </p>
                  <p>
                    {addressSnapshot.areaLocality && `${addressSnapshot.areaLocality}, `}
                    {addressSnapshot.city}, {addressSnapshot.state} – {addressSnapshot.pincode}
                  </p>
                  {addressSnapshot.landmark && (
                    <p className="text-[11px] text-foreground-muted pt-1">
                      Landmark: {addressSnapshot.landmark}
                    </p>
                  )}
                </div>
              </div>

              {/* Service Warranty Guarantee */}
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-emerald-900">
                <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-xs">
                  <div className="font-bold text-emerald-950">{warranty.title}</div>
                  <div className="text-emerald-800 text-[11px] leading-relaxed">
                    {warranty.description}
                  </div>
                </div>
              </div>
            </Card>

            {/* 2. Professional Information Card */}
            <Card className="p-5 sm:p-7 border border-border/90 shadow-sm bg-surface rounded-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="text-[11px] font-bold uppercase tracking-wider text-foreground-muted flex items-center gap-1.5">
                  <UserCheck className="h-4 w-4 text-accent" /> Assigned Verified Professional
                </span>
                <Badge
                  variant={professional ? "default" : "outline"}
                  className="text-[10px] font-bold"
                >
                  {professional ? "Assigned" : "Assigning"}
                </Badge>
              </div>

              {professional ? (
                <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-border bg-muted/20">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={professional.avatar || "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&q=80"}
                      alt={professional.name}
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-accent/30"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-heading font-bold text-sm text-primary">
                          {professional.name}
                        </span>
                        <Badge variant="accent" className="text-[9px] px-1.5 py-0">
                          VERIFIED PRO
                        </Badge>
                      </div>
                      <div className="text-xs text-foreground-secondary">{professional.trade}</div>
                      <div className="text-[11px] text-foreground-muted mt-0.5">
                        ⭐ {professional.rating} • {professional.experienceYears}+ years experience
                      </div>
                    </div>
                  </div>

                  {professional.phone && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`tel:${professional.phone}`)}
                      className="gap-1.5 font-semibold text-xs shrink-0"
                    >
                      <Phone className="h-3.5 w-3.5 text-accent" /> Call
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border/80">
                  <div className="h-8 w-8 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0 mt-0.5">
                    <UserCheck className="h-4 w-4 animate-pulse" />
                  </div>
                  <div className="space-y-0.5 text-xs">
                    <div className="font-bold text-primary">Finding your professional</div>
                    <p className="text-foreground-secondary text-[11px] leading-relaxed">
                      We are pairing your request with the closest certified technician across Kolkata. You will receive an SMS and live notification when accepted.
                    </p>
                  </div>
                </div>
              )}
            </Card>

            {/* 3. Booking Lifecycle Timeline */}
            <Card className="p-5 sm:p-7 border border-border/90 shadow-sm bg-surface rounded-2xl space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-foreground-muted block pb-2 border-b border-border">
                Booking Timeline
              </span>

              <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                {timeline.map((step) => {
                  const isDone = step.status === "completed";
                  const isCurrent = step.status === "current";

                  return (
                    <div key={step.key} className="relative space-y-0.5">
                      <div
                        className={`absolute -left-6 top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full text-[10px] font-bold ${
                          isDone
                            ? "bg-emerald-500 text-white ring-4 ring-emerald-50"
                            : isCurrent
                            ? "bg-accent text-white ring-4 ring-accent/20 animate-pulse"
                            : "bg-muted text-foreground-muted border border-border"
                        }`}
                      >
                        {isDone ? "✓" : isCurrent ? "•" : ""}
                      </div>

                      <div className="flex items-center justify-between">
                        <div
                          className={`text-xs font-bold ${
                            isDone || isCurrent ? "text-primary" : "text-foreground-muted"
                          }`}
                        >
                          {step.label}
                        </div>
                        {step.timestamp && (
                          <span className="text-[10px] text-foreground-muted font-mono">
                            {step.timestamp}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-foreground-secondary leading-normal">
                        {step.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* ════════ RIGHT COLUMN: PAYMENT & ACTIONS (5 COLS) ════════ */}
          <div className="lg:col-span-5 space-y-6">
            {/* 1. Payment Summary Card */}
            <Card className="p-5 sm:p-7 border border-border/90 shadow-sm bg-surface rounded-2xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <span className="text-[11px] font-bold uppercase tracking-wider text-foreground-muted">
                  Payment Summary
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    payment.isPaid
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {payment.status}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-foreground-secondary">
                  <span>Service Package Subtotal</span>
                  <span className="font-semibold text-primary">{formatCurrency(service.subtotal)}</span>
                </div>

                <div className="flex justify-between text-foreground-secondary">
                  <span>Safety, Sanitation & Convenience</span>
                  <span className="font-semibold text-primary">{formatCurrency(service.safetyFee)}</span>
                </div>

                {service.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount Applied</span>
                    <span>-{formatCurrency(service.discount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-foreground-secondary">
                  <span>GST Taxes (18% – SAC 998719)</span>
                  <span className="font-semibold text-primary">{formatCurrency(service.taxGst)}</span>
                </div>

                <div className="pt-3 border-t border-border flex justify-between items-center text-sm font-extrabold text-primary">
                  <span>Total Payable:</span>
                  <span className="text-lg font-mono text-[#0B2341]">
                    {formatCurrency(payment.totalPayable)}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-2 text-[11px] text-foreground-muted">
                  <CreditCard className="h-3.5 w-3.5 text-accent" />
                  <span>
                    Payment Method: <strong className="text-primary">{payment.method}</strong>
                  </span>
                </div>
              </div>
            </Card>

            {/* 2. Primary Tracking & Invoice Action Card */}
            <Card className="p-5 sm:p-7 border border-border/90 shadow-sm bg-surface rounded-2xl space-y-4">
              <div className="space-y-1">
                <h4 className="font-heading text-sm font-bold text-primary">
                  Next Step: Live Service Tracking
                </h4>
                <p className="text-xs text-foreground-secondary leading-relaxed">
                  Track your professional's real-time journey, view arrival ETA, inspect vehicle route, and verify secure arrival OTP on the live tracking screen.
                </p>
              </div>

              <div className="space-y-3 pt-1">
                <Button
                  variant="accent"
                  size="lg"
                  onClick={() => navigate(trackingUrl)}
                  className="w-full font-bold bg-[#FF6A00] hover:bg-[#E55F00] text-white shadow-md shadow-orange-500/20 text-sm gap-2"
                >
                  <Navigation className="h-4 w-4" /> Track Booking
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsInvoiceOpen(true)}
                  className="w-full font-semibold text-xs gap-2 border-border/80 hover:bg-muted/30"
                >
                  <FileText className="h-4 w-4 text-accent" /> View / Download Tax Invoice
                </Button>
              </div>

              <div className="pt-3 border-t border-border text-[11px] text-foreground-muted flex items-start gap-2">
                <span className="text-accent font-bold">ℹ</span>
                <span>
                  Home-e-Fix provides 100% verified tradesmen across Kolkata. Need to reschedule? Visit customer orders in your profile.
                </span>
              </div>
            </Card>

            {/* 3. Support & Trust Card */}
            <div className="p-4 rounded-2xl bg-muted/30 border border-border/70 space-y-2 text-xs">
              <div className="font-bold text-primary flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-accent" /> Home-e-Fix Customer Protection
              </div>
              <p className="text-[11px] text-foreground-secondary leading-relaxed">
                Have questions regarding your appointment? Contact our Kolkata operations helpdesk through the Help Center or email us at{" "}
                <a href="mailto:support@homeefix.in" className="text-accent underline font-medium">
                  support@homeefix.in
                </a>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── MOBILE STICKY BOTTOM ACTION BAR (< sm) ─── */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#071525]/95 backdrop-blur-md border-t border-border/80 px-4 py-3 pb-safe shadow-lg flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsInvoiceOpen(true)}
          className="px-3 font-semibold text-xs border-border shrink-0"
        >
          <FileText className="h-3.5 w-3.5" />
        </Button>

        <Button
          variant="accent"
          size="sm"
          onClick={() => navigate(trackingUrl)}
          className="flex-1 font-bold bg-[#FF6A00] hover:bg-[#E55F00] text-white shadow-md text-xs gap-1.5"
        >
          <Navigation className="h-3.5 w-3.5" /> Track Booking <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* ─── REAL DIGITAL TAX INVOICE MODAL ─── */}
      <InvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        bookingData={confirmation}
      />
    </div>
  );
}
