import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  ShieldCheck,
  Receipt,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Phone,
  Truck,
  Wrench,
  Download,
  Star,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusChip } from "@/components/ui/status-chip";
import { dbRepository, type MaterialRequest } from "@/services/db/repository";
import { formatDate, formatTime, formatDateTime } from "@/lib/date";
import { formatCurrency } from "@/lib/currency";
import { ROUTES } from "@/constants/routes";
import { LiveTrackingExperience } from "@/components/customer/LiveTrackingExperience";

export default function BookingDetail() {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<any | null>(null);
  const [materials, setMaterials] = useState<MaterialRequest[]>([]);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const loadData = () => {
    if (!id) return;
    const found = dbRepository.getBookingById(id);
    setBooking(found);
    if (found) {
      setMaterials(dbRepository.getMaterials(found.id));
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (!booking) {
    return (
      <div className="container-app py-12 max-w-3xl text-center space-y-4">
        <h2 className="font-heading text-xl font-bold text-primary">Booking Not Found</h2>
        <p className="text-xs text-foreground-secondary">
          No record matches reference #{id}. It may have been archived or removed.
        </p>
        <Button variant="accent" asChild>
          <Link to="/app/bookings">Back to My Bookings</Link>
        </Button>
      </div>
    );
  }

  const status = (booking.status || "CONFIRMED").toUpperCase();
  const bookingNumber = booking.booking_number || booking.id;
  const proName = booking.technician_name || "Suresh Reddy";
  const proPhone = booking.technician_phone || "+91 98765 43210";

  const addressText = typeof booking.address === "string"
    ? booking.address
    : booking.address?.street
      ? `${booking.address.street}, ${booking.address.city || "Kolkata"} - ${booking.address.pincode || ""}`
      : "Salt Lake Sector 1, Kolkata";

  const handleApproveMaterial = (matId: string) => {
    dbRepository.approveMaterial(matId);
    loadData();
    setActionNotice("Material request approved. Added to your itemized invoice.");
    setTimeout(() => setActionNotice(null), 6000);
  };

  const handleCancel = () => {
    dbRepository.updateBookingStatus(booking.id, "CANCELLED", "Customer requested cancellation");
    loadData();
    setActionNotice("Booking cancelled. Pre-paid balance scheduled for wallet credit.");
    setTimeout(() => setActionNotice(null), 6000);
  };

  const handleConfirmCompletion = () => {
    dbRepository.updateBookingStatus(booking.id, "COMPLETED", "Customer confirmed satisfactory service completion");
    loadData();
    setActionNotice("Service completed! Warranty activated for 30 days.");
    setTimeout(() => setActionNotice(null), 6000);
  };

  // Only show states that actually occurred in the booking timeline
  const timelineEvents = booking.timeline || [
    { status: "CONFIRMED", timestamp: booking.created_at, label: "Booking Placed Successfully" },
  ];

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/app/bookings" className="gap-1.5 text-xs font-semibold">
              <ArrowLeft className="h-4 w-4" /> My Bookings
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-primary font-mono">
                #{bookingNumber}
              </h1>
              {booking.is_dev_seed && (
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-amber-300 bg-amber-50 text-amber-800 font-bold">
                  DEV SEED
                </Badge>
              )}
            </div>
            <p className="text-xs text-foreground-secondary">
              Booked on {formatDateTime(booking.created_at)}
            </p>
          </div>
        </div>

        <StatusChip status={status} />
      </div>

      {/* ACTION NOTICE */}
      {actionNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 flex items-center justify-between gap-3 text-xs font-semibold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="font-bold px-2 py-0.5">
            ✕
          </button>
        </div>
      )}

      {/* MAIN DETAILS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: SERVICE & TIMELINE */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service Specs Card */}
          <Card className="p-6 border border-border bg-surface space-y-4">
            <h3 className="font-heading text-base font-bold text-primary border-b border-border pb-2 flex items-center gap-2">
              <Wrench className="h-4 w-4 text-accent" /> Service Specifications
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-heading text-sm font-bold text-primary">
                    {booking.service_name}
                  </h4>
                  <p className="text-foreground-secondary capitalize">
                    Category: {booking.category_slug || "Home Maintenance"}
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px] text-accent border-accent/30 font-semibold">
                  30-Day Warranty
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-border/60">
                <div className="flex items-center gap-2 text-foreground-secondary">
                  <Calendar className="h-4 w-4 text-accent shrink-0" />
                  <span>
                    Date: <strong className="text-primary">{formatDate(booking.scheduled_date)}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-foreground-secondary">
                  <Clock className="h-4 w-4 text-accent shrink-0" />
                  <span>
                    Slot: <strong className="text-primary">{booking.scheduled_time_slot}</strong>
                  </span>
                </div>
                <div className="flex items-start gap-2 col-span-full text-foreground-secondary">
                  <MapPin className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                  <span>
                    Address: <strong className="text-primary">{addressText}</strong>
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Assigned Technician Card */}
          <Card className="p-6 border border-border bg-surface space-y-4">
            <h3 className="font-heading text-base font-bold text-primary border-b border-border pb-2 flex items-center gap-2">
              <User className="h-4 w-4 text-accent" /> Assigned Verified Professional
            </h3>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center font-bold text-accent text-base shrink-0">
                  {proName.slice(0, 2).toUpperCase()}
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-heading font-bold text-sm text-primary">{proName}</h4>
                  <p className="text-foreground-muted">Verified Tradesman • Salt Lake Hub</p>
                  <div className="flex items-center gap-1.5 text-amber-500 font-bold">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <span>4.9 Rating (42 verified jobs)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Phone className="h-3.5 w-3.5 text-accent" />}
                  onClick={() => window.open(`tel:${proPhone}`)}
                  className="font-semibold"
                >
                  Call Pro
                </Button>
                {["PROFESSIONAL_ON_THE_WAY", "PROFESSIONAL_ARRIVED", "SERVICE_STARTED"].includes(status) && (
                  <Button
                    variant="accent"
                    size="sm"
                    leftIcon={<Truck className="h-3.5 w-3.5" />}
                    onClick={() => setIsTrackingOpen(true)}
                    className="font-bold"
                  >
                    Track Dispatch
                  </Button>
                )}
              </div>
            </div>

            {booking.start_otp && (
              <div className="p-3.5 rounded-xl bg-accent/5 border border-accent/20 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-primary block">Secure Start OTP</span>
                  <span className="text-[11px] text-foreground-secondary">
                    Provide this code to the technician upon arrival
                  </span>
                </div>
                <span className="font-mono text-xl font-extrabold text-accent tracking-widest">
                  {booking.start_otp}
                </span>
              </div>
            )}
          </Card>

          {/* Materials & Additional Charges Approval */}
          {materials.length > 0 && (
            <Card className="p-6 border border-amber-200 bg-amber-50/40 space-y-4">
              <h3 className="font-heading text-base font-bold text-amber-900 border-b border-amber-200 pb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600" /> Additional Spare Parts Requested
              </h3>

              <div className="space-y-3">
                {materials.map((mat) => (
                  <div
                    key={mat.id}
                    className="p-3.5 rounded-xl border border-amber-200 bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <h5 className="font-bold text-primary text-xs">{mat.itemName}</h5>
                      <p className="text-[11px] text-foreground-secondary">
                        Qty: {mat.quantity} × {formatCurrency(mat.unitPrice)} • Justification: {mat.justification}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm text-primary">
                        {formatCurrency(mat.totalAmount)}
                      </span>
                      {mat.status === "PENDING_APPROVAL" ? (
                        <Button
                          variant="accent"
                          size="sm"
                          onClick={() => handleApproveMaterial(mat.id)}
                          className="font-bold"
                        >
                          Approve Charge
                        </Button>
                      ) : (
                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 font-bold">
                          ✓ Approved
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Real Operational Timeline */}
          <Card className="p-6 border border-border bg-surface space-y-4">
            <h3 className="font-heading text-base font-bold text-primary border-b border-border pb-2 flex items-center gap-2">
              <Clock className="h-4 w-4 text-accent" /> Operational Service Timeline
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
              {timelineEvents.map((evt: any, i: number) => (
                <div key={i} className="relative flex items-start gap-3 text-xs">
                  <div className="absolute -left-6 mt-0.5 h-5 w-5 rounded-full bg-accent text-white flex items-center justify-center ring-4 ring-surface">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-primary text-xs">{evt.label || evt.status}</h5>
                    <span className="text-[11px] text-foreground-muted font-mono">
                      {formatDateTime(evt.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: INVOICE & ACTIONS */}
        <div className="space-y-6">
          {/* Itemized Financial Breakdown */}
          <Card className="p-6 border border-border bg-surface space-y-4">
            <h3 className="font-heading text-base font-bold text-primary border-b border-border pb-2 flex items-center gap-2">
              <Receipt className="h-4 w-4 text-accent" /> Itemized Invoice Summary
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-foreground-secondary">
                <span>Labour Subtotal</span>
                <span className="font-medium text-primary">{formatCurrency(booking.subtotal || 499)}</span>
              </div>
              <div className="flex justify-between text-foreground-secondary">
                <span>Safety & Hygiene Fee</span>
                <span className="font-medium text-primary">{formatCurrency(booking.safety_fee || 49)}</span>
              </div>
              <div className="flex justify-between text-foreground-secondary">
                <span>GST Tax (18%)</span>
                <span className="font-medium text-primary">{formatCurrency(booking.tax_gst || 98.64)}</span>
              </div>

              {Number(booking.discount) > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount</span>
                  <span>- {formatCurrency(booking.discount)}</span>
                </div>
              )}

              <div className="pt-3 border-t border-border flex justify-between font-heading text-base font-extrabold text-primary">
                <span>Total Settled</span>
                <span className="text-accent">{formatCurrency(booking.total_amount || 646.64)}</span>
              </div>

              <div className="pt-2 text-[11px] text-foreground-muted flex items-center justify-between border-t border-border/50">
                <span>Payment Method:</span>
                <span className="font-bold text-primary uppercase">{booking.payment_method || "UPI"}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-1.5"
                asChild
              >
                <Link to="/app/invoices">
                  <Download className="h-3.5 w-3.5" /> View Official GST Tax Invoice
                </Link>
              </Button>
            </div>
          </Card>

          {/* Contextual Actions Card */}
          <Card className="p-6 border border-border bg-surface space-y-3">
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-foreground-muted">
              Booking Actions
            </h4>

            {status === "SERVICE_COMPLETED" && (
              <Button
                variant="accent"
                className="w-full font-bold shadow-xs"
                onClick={handleConfirmCompletion}
              >
                Confirm Satisfaction & Activate Warranty
              </Button>
            )}

            {["CONFIRMED", "MATCHING", "ASSIGNMENT_PENDING"].includes(status) && (
              <Button
                variant="outline"
                className="w-full text-rose-600 border-rose-200 hover:bg-rose-50"
                onClick={handleCancel}
              >
                Cancel Booking
              </Button>
            )}

            <Button
              variant="outline"
              className="w-full"
              asChild
            >
              <Link to="/app/support">
                Contact 24/7 Support Desk
              </Link>
            </Button>
          </Card>
        </div>
      </div>

      {/* LIVE DISPATCH TRACKING MODAL */}
      <LiveTrackingExperience
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        booking={booking}
      />
    </div>
  );
}
