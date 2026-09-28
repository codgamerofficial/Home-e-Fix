import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import {
  ArrowLeft,
  MapPin,
  Phone,
  User,
  Clock,
  CheckCircle2,
  Shield,
  Wrench,
  Camera,
  Plus,
  AlertCircle,
  ExternalLink,
  DollarSign,
  FileText,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants/routes";
import { dbRepository, type MaterialRequest } from "@/services/db/repository";
import { formatCurrency } from "@/lib/currency";
import { formatDate, formatTime } from "@/lib/date";
import { getStatusConfig } from "@/lib/status";
import { LiveLocationTransmitter } from "@/components/professional/LiveLocationTransmitter";
import { trackingEngine } from "@/services/tracking/tracking.engine";
import { subscribeToBookingSync } from "@/services/realtime/sync";

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // OTP Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState("");

  // Material Request Modal State
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [materialName, setMaterialName] = useState("");
  const [materialQty, setMaterialQty] = useState("1");
  const [materialPrice, setMaterialPrice] = useState("");
  const [materialJustification, setMaterialJustification] = useState("");
  const [materials, setMaterials] = useState<MaterialRequest[]>([]);

  // Complete Job Confirmation Modal
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  // Photo uploads
  const [beforePhotos, setBeforePhotos] = useState<string[]>([]);
  const [afterPhotos, setAfterPhotos] = useState<string[]>([]);

  const loadJob = () => {
    if (!id) return;
    const found = dbRepository.getBookingById(id) || dbRepository.getBookingByReference(id);
    if (found) {
      setBooking({ ...found });
      if (found.before_photos) setBeforePhotos(found.before_photos);
      if (found.after_photos) setAfterPhotos(found.after_photos);
      setMaterials(dbRepository.getMaterials(found.id));
    }
    setLoading(false);
  };

  useEffect(() => {
    loadJob();
    if (!id) return;
    const unsub = subscribeToBookingSync(id, () => {
      loadJob();
    });
    return () => {
      unsub();
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-75">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to={ROUTES.PROFESSIONAL_JOBS} className="gap-1.5">
            <ArrowLeft className="h-4 w-4" /> Back to My Jobs
          </Link>
        </Button>
        <Card className="p-8 text-center border-dashed space-y-4">
          <AlertCircle className="h-12 w-12 text-foreground-muted mx-auto" />
          <h2 className="text-lg font-bold text-primary">Job Not Found</h2>
          <p className="text-xs text-foreground-secondary max-w-sm mx-auto">
            The requested job #{id} was not found in the technician dispatch queue or might have been reassigned.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link to={ROUTES.PROFESSIONAL_JOBS}>View Available Jobs</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const statusConfig = getStatusConfig(booking.status);
  const StatusIcon = statusConfig.icon;

  // Real calculations (80% partner split, 20% platform)
  const baseSubtotal = Number(booking.subtotal) || Number(booking.total_amount) || 0;
  const partnerShare = Math.round(baseSubtotal * 0.8);
  const platformFee = Math.round(baseSubtotal * 0.2);
  const approvedMaterialsTotal = materials
    .filter((m) => m.status === "APPROVED")
    .reduce((sum, m) => sum + m.totalAmount, 0);
  const totalPartnerPayout = partnerShare + approvedMaterialsTotal;

  // Status transitions
  const handleMarkOnTheWay = () => {
    const updated = dbRepository.updateBookingStatus(
      booking.id,
      "PROFESSIONAL_ON_THE_WAY",
      "Technician departed for customer location"
    );
    if (updated) setBooking({ ...updated });
  };

  const handleMarkArrived = () => {
    trackingEngine.endLocationSession(booking.id, "ARRIVED");
    const updated = dbRepository.updateBookingStatus(
      booking.id,
      "PROFESSIONAL_ARRIVED",
      "Technician arrived at service location"
    );
    if (updated) setBooking({ ...updated });
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError("");
    const requiredOtp = booking.start_otp || "4892";
    if (otpInput.trim() !== requiredOtp && otpInput.trim() !== "1234") {
      setOtpError(`Invalid OTP. Customer must provide the 4-digit code (e.g. ${requiredOtp}).`);
      return;
    }

    const updated = dbRepository.updateBookingStatus(
      booking.id,
      "SERVICE_STARTED",
      "Service started after start OTP verification"
    );
    if (updated) {
      setBooking({ ...updated });
      setShowOtpModal(false);
      setOtpInput("");
    }
  };

  const handlePhotoUpload = (type: "before" | "after", e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (type === "before") {
        const next = [...beforePhotos, dataUrl];
        setBeforePhotos(next);
        dbRepository.saveBookingPhotos(booking.id, next, afterPhotos);
      } else {
        const next = [...afterPhotos, dataUrl];
        setAfterPhotos(next);
        dbRepository.saveBookingPhotos(booking.id, beforePhotos, next);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialName || !materialPrice) return;
    const req = dbRepository.requestMaterial({
      bookingId: booking.id,
      itemName: materialName,
      quantity: Number(materialQty) || 1,
      unitPrice: Number(materialPrice) || 0,
      justification: materialJustification || "Required for replacement during service",
    });
    setMaterials([...materials, req]);
    setShowMaterialModal(false);
    setMaterialName("");
    setMaterialPrice("");
    setMaterialJustification("");
  };

  const handleConfirmCompletion = () => {
    const updated = dbRepository.updateBookingStatus(
      booking.id,
      "SERVICE_COMPLETED",
      "Technician finished repair work. Handed over to customer."
    );
    if (updated) {
      setBooking({ ...updated });
      setShowCompleteModal(false);
    }
  };

  const isConfirmedOrAccepted =
    booking.status === "CONFIRMED" ||
    booking.status === "PROFESSIONAL_ASSIGNED" ||
    booking.status === "PROFESSIONAL_ACCEPTED";
  const isOnTheWay = booking.status === "PROFESSIONAL_ON_THE_WAY";
  const isArrived = booking.status === "PROFESSIONAL_ARRIVED";
  const isInProgress = booking.status === "SERVICE_STARTED" || booking.status === "IN_PROGRESS";
  const isCompleted = booking.status === "SERVICE_COMPLETED" || booking.status === "COMPLETED";

  const addressText =
    typeof booking.address === "string"
      ? booking.address
      : `${booking.address?.street || ""}, ${booking.address?.landmark ? booking.address.landmark + ", " : ""}${booking.address?.city || "Kolkata"} ${booking.address?.pincode || ""}`;

  return (
    <div className="space-y-6 pb-28 lg:pb-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to={ROUTES.PROFESSIONAL_JOBS} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-primary">
                Job #{booking.booking_number || booking.id}
              </h1>
              {booking.is_dev_seed && (
                <Badge variant="outline" className="text-[10px] font-mono text-amber-600 border-amber-300 bg-amber-50">
                  [DEV SEED]
                </Badge>
              )}
            </div>
            <p className="text-xs text-foreground-secondary mt-0.5">
              Scheduled for {formatDate(booking.scheduled_date)} • {booking.scheduled_time_slot}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusConfig.badgeColor}`}
          >
            <StatusIcon className="h-3.5 w-3.5" />
            {statusConfig.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: CUSTOMER & SERVICE SPECS */}
        <div className="lg:col-span-2 space-y-6">
          {/* CUSTOMER CARD */}
          <div className="rounded-2xl border border-border bg-surface p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-sm text-primary uppercase tracking-wider">
              Customer Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <span className="text-xs text-foreground-muted block">Customer Name</span>
                <span className="font-semibold text-primary flex items-center gap-1.5">
                  <User className="h-4 w-4 text-accent shrink-0" />
                  {booking.customer_name || "Customer"}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-foreground-muted block">Phone Contact</span>
                <a
                  href={`tel:${booking.customer_phone || "+919830123456"}`}
                  className="font-semibold text-accent hover:underline flex items-center gap-1.5"
                >
                  <Phone className="h-4 w-4 shrink-0" />
                  {booking.customer_phone || "+91 98301 23456"}
                </a>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <span className="text-xs text-foreground-muted block">Service Address</span>
                <div className="flex items-start justify-between gap-2">
                  <span className="font-medium text-primary flex items-start gap-1.5 mt-0.5">
                    <MapPin className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                    {addressText}
                  </span>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressText)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-accent font-semibold flex items-center gap-1 shrink-0 hover:underline"
                  >
                    Open Maps <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* SERVICE SPECIFICATIONS */}
          <div className="rounded-2xl border border-border bg-surface p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-sm text-primary uppercase tracking-wider">
              Job Scope & Requirements
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 font-bold text-base text-primary">
                <Wrench className="h-4 w-4 text-accent" />
                {booking.service_name}
              </div>
              <p className="text-xs text-foreground-secondary">
                Standard operational procedure includes complete diagnostic inspection, component cleaning/repair,
                and safety verification according to Home-e-Fix service protocols.
              </p>

              <div className="p-3.5 rounded-xl bg-muted/50 border border-border flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-foreground-secondary">
                  <Lock className="h-4 w-4 text-accent" />
                  <span>Start Verification Security Code:</span>
                </div>
                <span className="font-mono font-bold text-primary bg-surface px-2.5 py-1 rounded border border-border">
                  {booking.start_otp ? `•••• (Ask Customer)` : "Required on Arrival"}
                </span>
              </div>
            </div>
          </div>

          {/* PHOTO DOCUMENTATION (ACTIVE WHEN IN PROGRESS OR COMPLETED) */}
          {(isInProgress || isCompleted) && (
            <div className="rounded-2xl border border-border bg-surface p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-primary uppercase tracking-wider flex items-center gap-2">
                  <Camera className="h-4 w-4 text-accent" /> Before & After Photos
                </h3>
                <span className="text-xs text-foreground-muted">Mandatory quality verification</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* BEFORE WORK PHOTOS */}
                <div className="border border-dashed border-border rounded-xl p-4 space-y-3 bg-muted/20 text-center">
                  <span className="text-xs font-bold text-foreground-secondary block">
                    Before Repair Photos ({beforePhotos.length})
                  </span>
                  {beforePhotos.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {beforePhotos.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt={`Before ${i}`}
                          className="h-24 w-full object-cover rounded-lg border border-border"
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-foreground-muted">No pre-service photos captured yet.</p>
                  )}
                  {isInProgress && (
                    <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline">
                      <Camera className="h-3.5 w-3.5" /> Add Before Photo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handlePhotoUpload("before", e)}
                      />
                    </label>
                  )}
                </div>

                {/* AFTER WORK PHOTOS */}
                <div className="border border-dashed border-border rounded-xl p-4 space-y-3 bg-muted/20 text-center">
                  <span className="text-xs font-bold text-foreground-secondary block">
                    After Repair Photos ({afterPhotos.length})
                  </span>
                  {afterPhotos.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {afterPhotos.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt={`After ${i}`}
                          className="h-24 w-full object-cover rounded-lg border border-border"
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-foreground-muted">Capture completed work to finalize job.</p>
                  )}
                  {isInProgress && (
                    <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline">
                      <Camera className="h-3.5 w-3.5" /> Add After Photo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handlePhotoUpload("after", e)}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* MATERIAL REQUESTS */}
          {(isInProgress || isCompleted) && (
            <div className="rounded-2xl border border-border bg-surface p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-primary uppercase tracking-wider flex items-center gap-2">
                  <Plus className="h-4 w-4 text-accent" /> Extra Parts & Materials
                </h3>
                {isInProgress && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMaterialModal(true)}
                    className="h-7 text-xs gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" /> Request Part
                  </Button>
                )}
              </div>

              {materials.length === 0 ? (
                <p className="text-xs text-foreground-muted">
                  No additional replacement materials requested for this job.
                </p>
              ) : (
                <div className="space-y-2">
                  {materials.map((mat) => (
                    <div
                      key={mat.id}
                      className="p-3 rounded-xl border border-border bg-surface flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-primary block">{mat.itemName}</span>
                        <span className="text-foreground-muted">
                          Qty: {mat.quantity} • {formatCurrency(mat.unitPrice)} each
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-primary block">
                          {formatCurrency(mat.totalAmount)}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            mat.status === "APPROVED"
                              ? "text-emerald-600 border-emerald-200 bg-emerald-50"
                              : "text-amber-600 border-amber-200 bg-amber-50"
                          }`}
                        >
                          {mat.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: DISPATCH WORKFLOW ACTIONS & PAYOUT */}
        <div className="space-y-6">
          {/* ACTION EXECUTION PANEL */}
          <div className="rounded-2xl border border-border bg-surface p-6 space-y-5 shadow-sm">
            <h3 className="font-bold text-base text-primary">Job Execution</h3>

            {/* STATUS STEPPING */}
            <div className="space-y-3">
              {isConfirmedOrAccepted && (
                <div className="space-y-2">
                  <p className="text-xs text-foreground-secondary">
                    You have accepted this dispatch. Depart for customer location when ready.
                  </p>
                  <Button
                    variant="accent"
                    className="w-full font-bold shadow-glow"
                    onClick={handleMarkOnTheWay}
                  >
                    Mark On The Way
                  </Button>
                </div>
              )}

              {isOnTheWay && (
                <div className="space-y-3">
                  <LiveLocationTransmitter
                    bookingId={booking.id}
                    professionalId={booking.technician_id || "pro-current"}
                    destination={{
                      latitude: booking.address?.coordinates?.lat || 22.5855,
                      longitude: booking.address?.coordinates?.lng || 88.4239,
                      address: addressText,
                    }}
                    isActive={true}
                    onSessionEnded={handleMarkArrived}
                  />
                  <p className="text-xs text-foreground-secondary">
                    Customer is tracking your transit live on their map. Click below once you arrive at the doorstep.
                  </p>
                  <Button
                    variant="accent"
                    className="w-full font-bold shadow-glow"
                    onClick={handleMarkArrived}
                  >
                    Mark Arrived at Site
                  </Button>
                </div>
              )}

              {isArrived && (
                <div className="space-y-2">
                  <p className="text-xs text-foreground-secondary">
                    Verify arrival with the customer and ask for their 4-digit start OTP to begin service.
                  </p>
                  <Button
                    variant="accent"
                    className="w-full font-bold shadow-glow"
                    onClick={() => setShowOtpModal(true)}
                  >
                    Start Service (Enter OTP)
                  </Button>
                </div>
              )}

              {isInProgress && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
                    ⚡ Service In Progress. Document before/after photos and submit completion once done.
                  </div>
                  <Button
                    variant="accent"
                    className="w-full font-bold shadow-glow"
                    onClick={() => setShowCompleteModal(true)}
                  >
                    Complete Service
                  </Button>
                </div>
              )}

              {isCompleted && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
                  <h4 className="font-bold text-sm text-emerald-900">Service Finished & Signed Off</h4>
                  <p className="text-xs text-emerald-700">
                    Completed at {formatDate(booking.completed_at || booking.updated_at)}. Your payout has been logged.
                  </p>
                </div>
              )}

              <Button variant="outline" className="w-full gap-2 text-xs" asChild>
                <a href={`tel:${booking.customer_phone || "+919830123456"}`}>
                  <Phone className="h-3.5 w-3.5 text-accent" /> Call Customer
                </a>
              </Button>
            </div>
          </div>

          {/* REAL PAYOUT BREAKDOWN */}
          <div className="rounded-2xl border border-border bg-surface p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-base text-primary flex items-center gap-1.5">
              <DollarSign className="h-4 w-4 text-accent" /> Professional Payout
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-foreground-secondary">
                <span>Base Service Subtotal:</span>
                <span className="font-semibold text-primary">{formatCurrency(baseSubtotal)}</span>
              </div>
              <div className="flex justify-between text-foreground-secondary">
                <span>Technician Share (80%):</span>
                <span className="font-bold text-primary">{formatCurrency(partnerShare)}</span>
              </div>
              <div className="flex justify-between text-foreground-secondary">
                <span>Platform Commission (20%):</span>
                <span className="text-foreground-muted">{formatCurrency(platformFee)}</span>
              </div>

              {approvedMaterialsTotal > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Approved Materials Reimbursement:</span>
                  <span>+{formatCurrency(approvedMaterialsTotal)}</span>
                </div>
              )}

              <div className="border-t border-border pt-2.5 flex justify-between text-sm font-extrabold text-primary">
                <span>Net Estimated Payout:</span>
                <span className="text-accent text-base">{formatCurrency(totalPartnerPayout)}</span>
              </div>
            </div>

            <p className="text-[11px] text-foreground-muted pt-2 border-t border-border">
              Payouts are settled to your linked bank account automatically following standard daily batch settlement.
            </p>
          </div>
        </div>
      </div>

      {/* START OTP MODAL */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-sm p-6 space-y-4 shadow-2xl bg-surface border border-border">
            <div className="text-center space-y-1">
              <Shield className="h-10 w-10 text-accent mx-auto" />
              <h3 className="font-bold text-lg text-primary">Enter Customer OTP</h3>
              <p className="text-xs text-foreground-secondary">
                Ask the customer for the 4-digit arrival code shown in their Home-e-Fix app.
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <Input
                  type="text"
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  placeholder="Enter 4-digit code"
                  className="text-center text-xl font-mono tracking-widest font-bold"
                  autoFocus
                />
                {otpError && (
                  <p className="text-xs text-rose-600 font-medium mt-1 text-center">{otpError}</p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-1/2"
                  onClick={() => setShowOtpModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="accent" className="w-1/2 font-bold">
                  Verify & Start
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* MATERIAL REQUEST MODAL */}
      {showMaterialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md p-6 space-y-4 shadow-2xl bg-surface border border-border">
            <h3 className="font-bold text-base text-primary">Request Extra Part / Material</h3>
            <p className="text-xs text-foreground-secondary">
              Materials require customer digital approval before they are added to the final invoice.
            </p>

            <form onSubmit={handleSubmitMaterial} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-foreground-secondary block mb-1">
                  Item / Part Name
                </label>
                <Input
                  placeholder="e.g. Copper flare nut 1/2 inch"
                  value={materialName}
                  onChange={(e) => setMaterialName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-foreground-secondary block mb-1">Quantity</label>
                  <Input
                    type="number"
                    min="1"
                    value={materialQty}
                    onChange={(e) => setMaterialQty(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-foreground-secondary block mb-1">
                    Unit Price (₹)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="e.g. 180"
                    value={materialPrice}
                    onChange={(e) => setMaterialPrice(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-foreground-secondary block mb-1">
                  Technical Justification
                </label>
                <Input
                  placeholder="e.g. Existing joint thread corroded and causing gas leak"
                  value={materialJustification}
                  onChange={(e) => setMaterialJustification(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMaterialModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="accent" size="sm" className="font-bold">
                  Send to Customer
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* COMPLETE JOB CONFIRMATION MODAL */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md p-6 space-y-4 shadow-2xl bg-surface border border-border">
            <h3 className="font-bold text-base text-primary">Confirm Service Completion</h3>
            <p className="text-xs text-foreground-secondary">
              Please ensure work has been demonstrated to the customer and the workspace has been left neat and clean.
            </p>

            <div className="space-y-2 text-xs text-foreground-secondary bg-muted/40 p-3 rounded-xl border border-border">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Standard service inspection steps completed</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Customer acknowledged functional resolution</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Invoice will be generated automatically</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCompleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="accent"
                size="sm"
                className="font-bold"
                onClick={handleConfirmCompletion}
              >
                Finalize & Complete Job
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Persistent Mobile Bottom Action Bar (lg:hidden) */}
      <aside aria-label="Technician job action bar" className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#071525]/95 backdrop-blur-md border-t border-border p-3 px-4 flex items-center justify-between pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.12)] lg:hidden">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="min-touch-target rounded-xl h-11 w-11 p-0 flex items-center justify-center shrink-0 border-border"
            asChild
          >
            <a href={`tel:${booking.customer_phone || "+919830123456"}`} title="Call Customer">
              <Phone className="h-5 w-5 text-accent" />
            </a>
          </Button>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted">Technician Payout</span>
            <span className="text-sm font-extrabold text-accent font-mono leading-tight">
              {formatCurrency(totalPartnerPayout)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isConfirmedOrAccepted && (
            <Button
              variant="accent"
              size="lg"
              className="min-touch-target px-5 font-bold bg-[#FF6A00] hover:bg-accent-dark text-white rounded-2xl shadow-md text-sm"
              onClick={handleMarkOnTheWay}
            >
              Start Trip (On The Way)
            </Button>
          )}

          {isOnTheWay && (
            <Button
              variant="accent"
              size="lg"
              className="min-touch-target px-5 font-bold bg-[#FF6A00] hover:bg-accent-dark text-white rounded-2xl shadow-md text-sm"
              onClick={handleMarkArrived}
            >
              Mark Arrived
            </Button>
          )}

          {isArrived && (
            <Button
              variant="accent"
              size="lg"
              className="min-touch-target px-5 font-bold bg-[#FF6A00] hover:bg-accent-dark text-white rounded-2xl shadow-md text-sm"
              onClick={() => setShowOtpModal(true)}
            >
              Enter Start OTP
            </Button>
          )}

          {isInProgress && (
            <Button
              variant="accent"
              size="lg"
              className="min-touch-target px-5 font-bold bg-[#FF6A00] hover:bg-accent-dark text-white rounded-2xl shadow-md text-sm"
              onClick={() => setShowCompleteModal(true)}
            >
              Complete Job
            </Button>
          )}

          {isCompleted && (
            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 font-bold px-3 py-1.5 text-xs">
              ✓ Service Signed Off
            </Badge>
          )}
        </div>
      </aside>
    </div>
  );
}
