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
  Printer,
  Shield,
  LifeBuoy,
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

  // Digital Invoice Modal State
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [digitalInvoice, setDigitalInvoice] = useState<any | null>(null);

  // Warranty State & Modal
  const [warranty, setWarranty] = useState<any | null>(null);
  const [showWarrantyModal, setShowWarrantyModal] = useState(false);
  const [warrantyIssue, setWarrantyIssue] = useState("");
  const [warrantySubmitted, setWarrantySubmitted] = useState(false);

  const loadData = () => {
    if (!id) return;
    const found = dbRepository.getBookingById(id);
    setBooking(found);
    if (found) {
      setMaterials(dbRepository.getMaterials(found.id));
      const inv = dbRepository.getDigitalInvoice(found.id);
      setDigitalInvoice(inv);
      const wrn = dbRepository.getWarrantyByBookingId(found.id);
      setWarranty(wrn);
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
                    asChild
                    variant="accent"
                    size="sm"
                    className="font-bold shadow-glow"
                  >
                    <Link to={`/app/bookings/${booking.id}/track`}>
                      <Truck className="h-3.5 w-3.5 mr-1.5" />
                      Track Live Map
                    </Link>
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
                onClick={() => setShowInvoiceModal(true)}
              >
                <Download className="h-3.5 w-3.5" /> View Official GST Tax Invoice
              </Button>
            </div>
          </Card>

          {/* Warranty & Assurance Card (Active or Eligible) */}
          {warranty && (
            <Card className="p-6 border border-emerald-200 bg-emerald-50/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-emerald-600" />
                  <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-emerald-900">
                    Workmanship Warranty
                  </h4>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-bold ${
                    warranty.status === "ACTIVE"
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : "bg-slate-100 text-slate-600 border-slate-300"
                  }`}
                >
                  {warranty.status}
                </Badge>
              </div>

              <div className="text-xs space-y-1 text-emerald-950">
                <p className="font-mono text-[11px] text-emerald-800">{warranty.warrantyNumber}</p>
                <p className="text-[11px] text-foreground-secondary">
                  Coverage: {warranty.terms}
                </p>
                <p className="text-[11px] text-foreground-secondary">
                  Valid until: <strong className="text-emerald-900">{formatDate(warranty.expiresAt)}</strong>
                </p>
              </div>

              {warranty.status === "ACTIVE" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs font-semibold border-emerald-300 text-emerald-800 hover:bg-emerald-100/50"
                  onClick={() => setShowWarrantyModal(true)}
                >
                  <LifeBuoy className="h-3.5 w-3.5 mr-1" /> File Warranty Claim / Revisit
                </Button>
              )}
            </Card>
          )}

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

      {/* DIGITAL GST TAX INVOICE MODAL */}
      {showInvoiceModal && digitalInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <Card className="w-full max-w-xl border border-border bg-surface p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-accent" />
                <h3 className="font-heading text-base font-bold text-primary">
                  Official GST Tax Invoice
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowInvoiceModal(false)}
                className="text-foreground-muted hover:text-primary font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Printable Invoice Sheet */}
            <div className="p-6 rounded-xl border border-border bg-white text-slate-900 space-y-4 text-xs">
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <h2 className="font-heading text-lg font-extrabold text-slate-900">
                    Home-e-Fix Technologies Pvt. Ltd.
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Salt Lake Sector 1, Bidhannagar, Kolkata, WB 700064
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    GSTIN: {digitalInvoice.gstinBusiness} | CIN: U72900WB2026PTC123456
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-xs font-mono font-bold text-slate-900 border-slate-300">
                    ORIGINAL FOR RECIPIENT
                  </Badge>
                  <p className="text-[11px] text-slate-500 mt-1 font-mono">{digitalInvoice.invoiceNumber}</p>
                  <p className="text-[11px] text-slate-500">Date: {digitalInvoice.bookingDate}</p>
                </div>
              </div>

              {/* Billed To */}
              <div className="grid grid-cols-2 gap-4 py-2 border-b border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Billed To (Recipient)
                  </span>
                  <p className="font-bold text-slate-800 text-xs">{digitalInvoice.customerName}</p>
                  <p className="text-[11px] text-slate-600">{digitalInvoice.customerAddress}</p>
                  <p className="text-[11px] text-slate-600 font-mono">{digitalInvoice.customerPhone}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Service Reference
                  </span>
                  <p className="font-mono text-slate-800 font-bold">{digitalInvoice.bookingNumber}</p>
                  <p className="text-[11px] text-slate-600">Assigned Pro: {digitalInvoice.technicianName}</p>
                  <p className="text-[11px] text-slate-600">
                    Payment: <span className="uppercase font-semibold">{digitalInvoice.paymentMethod}</span> ({digitalInvoice.paymentStatus})
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="py-2">Description of Supply</th>
                    <th className="py-2">SAC Code</th>
                    <th className="py-2 text-right">Taxable Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2.5 font-medium text-slate-900">{digitalInvoice.serviceName}</td>
                    <td className="py-2.5 font-mono text-slate-600">998719</td>
                    <td className="py-2.5 text-right font-medium">{formatCurrency(digitalInvoice.taxableAmount)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-medium text-slate-900">Safety, Sanitation & Convenience Fee</td>
                    <td className="py-2 font-mono text-slate-600">998719</td>
                    <td className="py-2 text-right font-medium">{formatCurrency(digitalInvoice.safetyFee)}</td>
                  </tr>
                  {digitalInvoice.discountAmount > 0 && (
                    <tr className="text-emerald-700">
                      <td className="py-2 font-medium">Promotional Discount Applied</td>
                      <td className="py-2 font-mono">—</td>
                      <td className="py-2 text-right font-medium">- {formatCurrency(digitalInvoice.discountAmount)}</td>
                    </tr>
                  )}
                  <tr>
                    <td className="py-2 text-slate-600">Central GST (CGST 9%)</td>
                    <td className="py-2 font-mono text-slate-600">—</td>
                    <td className="py-2 text-right font-medium">{formatCurrency(digitalInvoice.cgstAmount)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-slate-600">State GST (SGST 9%)</td>
                    <td className="py-2 font-mono text-slate-600">—</td>
                    <td className="py-2 text-right font-medium">{formatCurrency(digitalInvoice.sgstAmount)}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="border-t border-slate-300 font-bold text-sm">
                    <td colSpan={2} className="py-3 text-slate-900">Total Invoice Amount (INR):</td>
                    <td className="py-3 text-right text-slate-900">{formatCurrency(digitalInvoice.totalAmount)}</td>
                  </tr>
                </tfoot>
              </table>

              <div className="pt-3 border-t border-slate-200 text-[10px] text-slate-500 space-y-1">
                <p>• {digitalInvoice.warrantyCoverage}</p>
                <p>• This is a computer-generated tax invoice issued in accordance with GST Law and does not require physical signature.</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowInvoiceModal(false)}>
                Close
              </Button>
              <Button variant="accent" size="sm" onClick={() => window.print()} className="gap-1.5 font-bold">
                <Printer className="h-4 w-4" /> Print / Save PDF
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* WARRANTY CLAIM MODAL */}
      {showWarrantyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <Card className="w-full max-w-lg border border-border bg-surface p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <h3 className="font-heading text-base font-bold text-primary">
                  File Warranty Revisit Claim
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowWarrantyModal(false);
                  setWarrantySubmitted(false);
                }}
                className="text-foreground-muted hover:text-primary font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {warrantySubmitted ? (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-base text-primary">Warranty Claim Submitted</h4>
                <p className="text-xs text-foreground-secondary max-w-sm mx-auto">
                  Our quality audit team has received your claim. A senior supervisor will review your report and schedule a free priority re-work visit within 24 hours.
                </p>
                <Button
                  variant="accent"
                  size="sm"
                  onClick={() => {
                    setShowWarrantyModal(false);
                    setWarrantySubmitted(false);
                    loadData();
                  }}
                  className="font-bold"
                >
                  Done
                </Button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!warrantyIssue.trim()) return;
                  dbRepository.createWarrantyClaim(booking.id, warrantyIssue.trim());
                  setWarrantySubmitted(true);
                  setWarrantyIssue("");
                }}
                className="space-y-4 text-xs"
              >
                <div className="p-3 rounded-xl bg-accent/5 border border-accent/20 text-xs">
                  <p className="font-semibold text-primary">Booking: #{booking.booking_number || booking.id}</p>
                  <p className="text-foreground-secondary">{booking.service_name}</p>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-foreground-secondary block mb-1">
                    Describe the recurring problem or defect:
                  </label>
                  <textarea
                    rows={4}
                    value={warrantyIssue}
                    onChange={(e) => setWarrantyIssue(e.target.value)}
                    placeholder="Please explain what is not working after the service was completed..."
                    className="w-full rounded-xl border border-border p-2.5 bg-background text-primary text-xs resize-none focus:outline-none focus:ring-1 focus:ring-accent"
                    required
                  />
                </div>

                <p className="text-[11px] text-foreground-muted">
                  Note: Home-e-Fix covers 100% rework labour charges under our verified workmanship guarantee.
                </p>

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowWarrantyModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="accent"
                    size="sm"
                    className="font-bold"
                  >
                    Submit Claim
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
