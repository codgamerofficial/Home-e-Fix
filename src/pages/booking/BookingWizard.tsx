import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  Upload,
  Plus,
  Trash2,
  Tag,
  CreditCard,
  Wallet,
  Building,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Zap,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { ProgressTimeline } from "@/components/ui/progress-timeline";
import { ROUTES } from "@/constants/routes";
import { POPULAR_SERVICES } from "@/constants/services";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import { displayRazorpayCheckout } from "@/lib/razorpay";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import { dbRepository } from "@/services/db/repository";
import { pricingEngine } from "@/services/marketplace/pricing.engine";
import { serviceabilityEngine } from "@/services/marketplace/serviceability.engine";
import { slotEngine } from "@/services/marketplace/slot.engine";
import { paymentOrchestrator } from "@/lib/payments/orchestrator";

export default function BookingWizard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { items: cartItems, addItem, removeItem, clearCart } = useCartStore();
  const { user } = useAuthStore();

  // Wizard Stage (0 to 5)
  const [currentStep, setCurrentStep] = useState<number>(0);

  // Selected Service Items fallback
  const selectedServices = cartItems.length > 0 ? cartItems : [POPULAR_SERVICES[0]];
  const primaryService = selectedServices[0] || POPULAR_SERVICES[0];
  const categorySlug = (primaryService.category?.slug || primaryService.category || "ac") as string;

  // Category-Specific Questions State
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, string>>({
    ac_tonnage: "1.5 Ton (Most Common)",
    ac_type: "Split AC (High-wall)",
    plumbing_fixture: "Bathroom washbasin",
    cleaning_bhk: "2 BHK Apartment",
    electrician_issue: "Switchboard / Socket burning",
  });

  // Emergency Option
  const [isEmergencyRequested, setIsEmergencyRequested] = useState(false);

  // Address State (Dynamically loaded from real user repository)
  const [addresses, setAddresses] = useState<any[]>(() => dbRepository.getAddresses(user?.id));
  const [selectedAddressId, setSelectedAddressId] = useState<string>(() => {
    const saved = dbRepository.getAddresses(user?.id);
    return saved.length > 0 ? (saved.find((a) => a.isDefault)?.id || saved[0].id) : "";
  });
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [newAddrForm, setNewAddrForm] = useState({
    title: "Home",
    type: "home" as "home" | "work" | "other",
    streetAddress: "",
    landmark: "",
    city: "Kolkata",
    pincode: "700064",
  });

  // Schedule State
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedSlotId, setSelectedSlotId] = useState<string>("");

  // Photos & Notes
  const [customerNotes, setCustomerNotes] = useState("");
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);

  // Coupon State
  const [couponCode, setCouponCode] = useState("FIRSTFIX100");
  const [couponNotice, setCouponNotice] = useState<{ valid?: boolean; message?: string }>({});

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "wallet" | "cash">("upi");
  const [paymentErrorNotice, setPaymentErrorNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active Address & Serviceability Check
  const currentAddress = addresses.find((a) => a.id === selectedAddressId) || addresses[0];
  const serviceability = useMemo(() => {
    return serviceabilityEngine.checkPincode(currentAddress?.pincode || "700064", isEmergencyRequested);
  }, [currentAddress, isEmergencyRequested]);

  // Dynamic Available Slots
  const generatedSlots = useMemo(() => {
    if (isEmergencyRequested) {
      const emSlot = slotEngine.getEmergencySlot();
      return emSlot ? [emSlot] : [];
    }
    return slotEngine.generateSlotsForDate(selectedDate || new Date());
  }, [selectedDate, isEmergencyRequested]);

  // Set default slot if unset
  useMemo(() => {
    if (generatedSlots.length > 0 && !selectedSlotId) {
      const firstAvail = generatedSlots.find((s) => s.isAvailable);
      if (firstAvail) setSelectedSlotId(firstAvail.slotId);
    }
  }, [generatedSlots, selectedSlotId]);

  // Pricing Calculation via Engine
  const baseLaborPrice = selectedServices.reduce(
    (sum, s: any) => sum + (s.discountedPrice || s.basePrice || 499) * (s.quantity || 1),
    0
  );

  const isPlusMember = Boolean(user?.isVerified); // PLUS check

  const pricingBreakdown = useMemo(() => {
    return pricingEngine.calculate({
      basePrice: baseLaborPrice,
      quantity: 1,
      isEmergency: isEmergencyRequested,
      couponCode: couponNotice.valid ? couponCode : undefined,
      isPlusMember,
    });
  }, [baseLaborPrice, isEmergencyRequested, couponCode, couponNotice, isPlusMember]);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const res = pricingEngine.validateCoupon(couponCode, pricingBreakdown.subtotal);
    setCouponNotice({ valid: res.valid, message: res.message });
  };

  const handleCreateAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrForm.streetAddress || !newAddrForm.pincode) return;

    const newAddr: any = {
      userId: user?.id || "usr-guest",
      user_id: user?.id || "usr-guest",
      title: newAddrForm.title,
      type: newAddrForm.type,
      streetAddress: newAddrForm.streetAddress,
      landmark: newAddrForm.landmark,
      city: newAddrForm.city,
      state: "West Bengal",
      pincode: newAddrForm.pincode,
      isDefault: addresses.length === 0,
    };

    const saved = dbRepository.saveAddress(newAddr);
    const updatedList = dbRepository.getAddresses(user?.id);
    setAddresses(updatedList);
    setSelectedAddressId(saved.id || (updatedList.length > 0 ? updatedList[updatedList.length - 1].id : ""));
    setShowAddAddressModal(false);
  };

  const handleConfirmBooking = async () => {
    if (!serviceability.isServiceable) {
      setPaymentErrorNotice("Your selected address is outside active service zones. Please choose a serviceable address.");
      return;
    }

    setIsSubmitting(true);
    setPaymentErrorNotice(null);

    try {
      const activeSlot = generatedSlots.find((s) => s.slotId === selectedSlotId);
      const slotLabel = activeSlot ? activeSlot.timeRangeLabel : "09:00 AM - 11:00 AM";

      const createdBooking = dbRepository.createBooking({
        serviceId: primaryService.id,
        serviceName: primaryService.name,
        categorySlug: categorySlug,
        customerId: user?.id || "usr-guest",
        customerName: user?.fullName || "Valued Customer",
        customerPhone: user?.phone || "+91 98300 00000",
        customerEmail: user?.email || "customer@homeefix.in",
        address: currentAddress.streetAddress || "Kolkata Hub",
        scheduledDate: formatDate(selectedDate || new Date()),
        scheduledTimeSlot: slotLabel,
        subtotal: pricingBreakdown.subtotal,
        safetyFee: pricingBreakdown.safetyFee,
        taxGst: pricingBreakdown.taxGst,
        discount: pricingBreakdown.discountCoupon + pricingBreakdown.discountMembership,
        totalAmount: pricingBreakdown.totalPayableInr,
        paymentMethod: paymentMethod.toUpperCase(),
      });

      // If Razorpay online payment selected
      if (paymentMethod === "upi" || paymentMethod === "card") {
        try {
          await displayRazorpayCheckout({
            amount: pricingBreakdown.totalPayableInr,
            bookingId: createdBooking.id,
            purpose: "BOOKING",
            name: "Home-e-Fix",
            description: `${primaryService.name} Booking`,
            customerName: user?.fullName || "Valued Customer",
            customerEmail: user?.email || "customer@homeefix.in",
            customerPhone: user?.phone || "9830000000",
            onSuccess: (paymentId: string) => {
              dbRepository.updateBookingStatus(createdBooking.id, "CONFIRMED", `Payment verified via Razorpay: ${paymentId}`);
              clearCart();
              navigate(`/booking/confirmation/${createdBooking.booking_number}`);
            },
            onCancel: () => {
              setPaymentErrorNotice("Payment window closed. Your booking is placed with pending payment status.");
              clearCart();
              navigate(`/booking/confirmation/${createdBooking.booking_number}`);
            },
            onFailure: (err) => {
              console.warn("Payment Gateway failure:", err);
            },
          });
          return;
        } catch (gatewayErr: any) {
          console.warn("Payment Gateway fallback to Pay After Service:", gatewayErr);
        }
      }

      // Cash after service or instant confirmation
      clearCart();
      navigate(`/booking/confirmation/${createdBooking.booking_number}`);
    } catch (err: any) {
      setPaymentErrorNotice(err.message || "Failed to create booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Steps Progress
  const wizardSteps = [
    { title: "Service", status: currentStep > 0 ? "completed" : currentStep === 0 ? "current" : "upcoming" },
    { title: "Questions", status: currentStep > 1 ? "completed" : currentStep === 1 ? "current" : "upcoming" },
    { title: "Address", status: currentStep > 2 ? "completed" : currentStep === 2 ? "current" : "upcoming" },
    { title: "Slot", status: currentStep > 3 ? "completed" : currentStep === 3 ? "current" : "upcoming" },
    { title: "Summary", status: currentStep > 4 ? "completed" : currentStep === 4 ? "current" : "upcoming" },
    { title: "Payment", status: currentStep === 5 ? "current" : "upcoming" },
  ] as const;

  return (
    <div className="container-app py-8 max-w-4xl space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-extrabold text-primary">
              Book Home Service
            </h1>
            <Badge variant="secondary" className="bg-[#FF6A00]/10 text-[#FF6A00] font-bold text-[10px]">
              Guaranteed Pricing
            </Badge>
          </div>
          <p className="text-xs text-foreground-secondary mt-1">
            Service booked in Salt Lake & New Town operational hubs with 30-day warranty
          </p>
        </div>

        <Button variant="ghost" size="sm" asChild>
          <button type="button" onClick={() => navigate(-1)} className="text-xs gap-1.5 cursor-pointer">
            <ArrowLeft className="h-4 w-4" /> Go Back
          </button>
        </Button>
      </div>

      {/* Progress Timeline */}
      <ProgressTimeline steps={wizardSteps as any} />

      {/* ERROR / NOTICE BANNER */}
      {paymentErrorNotice && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between gap-3 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
            <span>{paymentErrorNotice}</span>
          </div>
          <button onClick={() => setPaymentErrorNotice(null)} className="font-bold px-2 py-0.5">✕</button>
        </div>
      )}

      {/* MAIN STEP CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* STEP 0: SERVICE SPEC */}
          {currentStep === 0 && (
            <Card className="p-6 border border-border bg-surface space-y-6">
              <h2 className="font-heading text-lg font-bold text-primary flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent" /> Selected Service Package
              </h2>

              <div className="flex items-start justify-between p-4 rounded-2xl bg-muted/40 border border-border">
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-primary">{primaryService.name}</h3>
                  <p className="text-xs text-foreground-secondary">
                    {(primaryService as any).shortDescription || (primaryService as any).description || ""}
                  </p>
                  <div className="flex items-center gap-2 pt-2 text-[11px] text-foreground-muted">
                    <span>⏱️ 45-60 mins</span>
                    <span>•</span>
                    <span className="text-success font-bold">🛡️ 30-Day Warranty</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-lg text-[#FF6A00]">
                  {formatCurrency(baseLaborPrice)}
                </span>
              </div>

              {/* Emergency Surcharge Toggle */}
              <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-amber-600 fill-amber-500" />
                    <span className="font-bold text-xs text-amber-900">Need Emergency Dispatch Within 2 Hours?</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Priority allocation of closest certified master technician. Emergency visit fee ₹499 applies.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={isEmergencyRequested}
                  onChange={(e) => setIsEmergencyRequested(e.target.checked)}
                  className="h-5 w-5 accent-[#FF6A00] cursor-pointer mt-1"
                />
              </div>

              <div className="flex justify-end">
                <Button variant="accent" onClick={() => setCurrentStep(1)} className="gap-2">
                  Continue to Requirements <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 1: SERVICE SPECIFIC QUESTIONS */}
          {currentStep === 1 && (
            <Card className="p-6 border border-border bg-surface space-y-6">
              <div>
                <h2 className="font-heading text-lg font-bold text-primary flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-accent" /> Service Diagnosis Questions
                </h2>
                <p className="text-xs text-foreground-secondary mt-1">
                  Help the technician arrive with the exact replacement materials and diagnostic equipment
                </p>
              </div>

              {categorySlug.includes("ac") ? (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-primary">AC System Type</label>
                    <select
                      value={questionAnswers.ac_type}
                      onChange={(e) => setQuestionAnswers({ ...questionAnswers, ac_type: e.target.value })}
                      className="w-full mt-1.5 p-2.5 rounded-xl border border-border bg-surface text-xs"
                    >
                      <option>Split AC (High-wall mounted)</option>
                      <option>Window AC</option>
                      <option>Inverter Split AC (5 Star)</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-primary">Approximate Tonnage</label>
                    <select
                      value={questionAnswers.ac_tonnage}
                      onChange={(e) => setQuestionAnswers({ ...questionAnswers, ac_tonnage: e.target.value })}
                      className="w-full mt-1.5 p-2.5 rounded-xl border border-border bg-surface text-xs"
                    >
                      <option>1.0 Ton</option>
                      <option>1.5 Ton (Most Common)</option>
                      <option>2.0 Ton or above</option>
                    </select>
                  </div>
                </div>
              ) : categorySlug.includes("plumb") ? (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-primary">Fixture Location</label>
                    <select
                      value={questionAnswers.plumbing_fixture}
                      onChange={(e) => setQuestionAnswers({ ...questionAnswers, plumbing_fixture: e.target.value })}
                      className="w-full mt-1.5 p-2.5 rounded-xl border border-border bg-surface text-xs"
                    >
                      <option>Bathroom washbasin</option>
                      <option>Kitchen sink</option>
                      <option>Shower mixer area</option>
                      <option>Toilet cistern / flush tank</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-primary">Primary Issue Description</label>
                    <Input
                      placeholder="e.g. Loose switch, noisy fan capacitor, leaking water"
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                      className="text-xs mt-1.5"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4 border-t border-border">
                <Button variant="outline" onClick={() => setCurrentStep(0)}>Back</Button>
                <Button variant="accent" onClick={() => setCurrentStep(2)} className="gap-2">
                  Select Address <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 2: ADDRESS & SERVICEABILITY */}
          {currentStep === 2 && (
            <Card className="p-6 border border-border bg-surface space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-heading text-lg font-bold text-primary flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-accent" /> Service Location
                  </h2>
                  <p className="text-xs text-foreground-secondary mt-1">
                    Select delivery address to confirm local serviceability
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowAddAddressModal(true)} className="text-xs gap-1">
                  <Plus className="h-3.5 w-3.5" /> Add Address
                </Button>
              </div>

              {/* Address Cards */}
              {addresses.length === 0 ? (
                <div className="p-8 rounded-2xl border border-dashed border-border text-center space-y-3 bg-muted/20">
                  <MapPin className="h-8 w-8 text-foreground-muted mx-auto" />
                  <p className="font-bold text-sm text-primary">No saved addresses found</p>
                  <p className="text-xs text-foreground-secondary max-w-sm mx-auto">
                    Please add your service delivery address in Kolkata to verify local serviceability and dispatch slots.
                  </p>
                  <Button variant="accent" size="sm" onClick={() => setShowAddAddressModal(true)} className="gap-1.5 font-bold">
                    <Plus className="h-4 w-4" /> Add Service Address
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? "border-accent bg-accent/5 ring-2 ring-accent/20"
                            : "border-border bg-surface hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-primary">{addr.title}</span>
                          {isSelected && <CheckCircle2 className="h-4 w-4 text-[#FF6A00]" />}
                        </div>
                        <p className="text-xs text-foreground-secondary mt-1 leading-relaxed">
                          {addr.streetAddress}, {addr.city} - {addr.pincode}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Serviceability Result Box */}
              <div
                className={`p-4 rounded-2xl flex items-start gap-3 text-xs ${
                  serviceability.isServiceable
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}
              >
                {serviceability.isServiceable ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-bold">
                    {serviceability.isServiceable ? "Service Available" : "Out of Service Zone"}
                  </p>
                  <p className="mt-0.5 leading-relaxed">
                    {serviceability.isServiceable
                      ? `Your location is served by the ${serviceability.zoneCode} operational hub.`
                      : serviceability.reason}
                  </p>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-border">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>Back</Button>
                <Button
                  variant="accent"
                  disabled={!serviceability.isServiceable}
                  onClick={() => setCurrentStep(3)}
                  className="gap-2"
                >
                  Choose Time Slot <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 3: SCHEDULE & SLOTS */}
          {currentStep === 3 && (
            <Card className="p-6 border border-border bg-surface space-y-6">
              <div>
                <h2 className="font-heading text-lg font-bold text-primary flex items-center gap-2">
                  <Clock className="h-5 w-5 text-accent" /> Appointment Date & Slot
                </h2>
                <p className="text-xs text-foreground-secondary mt-1">
                  Generated in real-time based on active technician capacity
                </p>
              </div>

              {!isEmergencyRequested && (
                <div>
                  <label className="text-xs font-bold text-primary mb-2 block">Select Appointment Date</label>
                  <DatePicker
                    selectedDate={selectedDate}
                    onSelectDate={(d: Date) => setSelectedDate(d)}
                    minDate={new Date()}
                  />
                </div>
              )}

              {/* Slots Grid */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-primary block">
                  {isEmergencyRequested ? "Emergency Arrival Window" : "Available Time Slots"}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {generatedSlots.map((slot) => {
                    const isSelected = selectedSlotId === slot.slotId;
                    return (
                      <button
                        key={slot.slotId}
                        type="button"
                        disabled={!slot.isAvailable}
                        onClick={() => setSelectedSlotId(slot.slotId)}
                        className={`p-3.5 rounded-2xl border text-left transition-all ${
                          !slot.isAvailable
                            ? "opacity-40 bg-slate-100 border-border cursor-not-allowed"
                            : isSelected
                            ? "border-accent bg-accent/5 ring-2 ring-accent/20 cursor-pointer"
                            : "border-border bg-surface hover:border-slate-300 cursor-pointer"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-primary">{slot.timeRangeLabel}</span>
                          {isSelected && <CheckCircle2 className="h-4 w-4 text-[#FF6A00]" />}
                        </div>
                        <div className="text-[10px] text-foreground-muted mt-1">
                          {slot.isAvailable ? `Capacity: ${slot.capacityScore} slots open` : "Slot filled / past"}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-border">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>Back</Button>
                <Button variant="accent" disabled={!selectedSlotId} onClick={() => setCurrentStep(4)} className="gap-2">
                  Review Summary <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 4: ORDER REVIEW */}
          {currentStep === 4 && (
            <Card className="p-6 border border-border bg-surface space-y-6">
              <div>
                <h2 className="font-heading text-lg font-bold text-primary flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-accent" /> Booking Review & Coupon
                </h2>
                <p className="text-xs text-foreground-secondary mt-1">
                  Review itemized price and apply coupons or membership discounts
                </p>
              </div>

              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <Input
                  placeholder="Enter Coupon Code (FIRSTFIX100, HOMEEFIX20)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="text-xs uppercase"
                />
                <Button type="submit" variant="outline" size="sm" className="text-xs shrink-0">
                  Apply Coupon
                </Button>
              </form>

              {couponNotice.message && (
                <p className={`text-xs font-bold ${couponNotice.valid ? "text-emerald-700" : "text-rose-600"}`}>
                  {couponNotice.message}
                </p>
              )}

              {/* PLUS Membership Notice */}
              {isPlusMember && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-300 text-amber-900 flex items-center gap-2 text-xs font-bold">
                  <Sparkles className="h-4 w-4 text-amber-600" />
                  Home-e-Fix PLUS Member: 20% discount applied on labour + ₹29 safety fee waived!
                </div>
              )}

              <div className="flex justify-between pt-4 border-t border-border">
                <Button variant="outline" onClick={() => setCurrentStep(3)}>Back</Button>
                <Button variant="accent" onClick={() => setCurrentStep(5)} className="gap-2">
                  Proceed to Payment <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 5: PAYMENT SELECTION */}
          {currentStep === 5 && (
            <Card className="p-6 border border-border bg-surface space-y-6">
              <div>
                <h2 className="font-heading text-lg font-bold text-primary flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-accent" /> Select Payment Method
                </h2>
                <p className="text-xs text-foreground-secondary mt-1">
                  100% server-authoritative payment. Cashless online or pay after service completion.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: "upi", label: "Instant UPI (GPay, PhonePe, Paytm)", icon: Zap },
                  { id: "card", label: "Credit / Debit Card (All Banks)", icon: CreditCard },
                  { id: "wallet", label: "Home-e-Fix Wallet", icon: Wallet },
                  { id: "cash", label: "Pay After Service Completion", icon: CheckCircle },
                ].map((pm) => {
                  const isSelected = paymentMethod === pm.id;
                  const Icon = pm.icon;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id as any)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "border-accent bg-accent/5 ring-2 ring-accent/20"
                          : "border-border bg-surface hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-[#FF6A00]" />
                          <span className="font-bold text-xs text-primary">{pm.label}</span>
                        </div>
                        {isSelected && <CheckCircle2 className="h-4 w-4 text-[#FF6A00]" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between pt-4 border-t border-border">
                <Button variant="outline" onClick={() => setCurrentStep(4)}>Back</Button>
                <Button
                  variant="accent"
                  size="lg"
                  disabled={isSubmitting}
                  onClick={handleConfirmBooking}
                  className="shadow-glow gap-2"
                >
                  {isSubmitting ? "Placing Booking..." : `Confirm Booking • ${formatCurrency(pricingBreakdown.totalPayableInr)}`}
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Right 1 Column: Authoritative Bill Breakdown */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-3xl border border-border bg-surface p-6 shadow-sm space-y-4">
            <h3 className="font-heading text-sm font-bold text-primary uppercase tracking-wider">
              Payment Breakdown
            </h3>

            <div className="space-y-2.5 text-xs text-foreground-secondary border-t border-border pt-4">
              <div className="flex justify-between">
                <span>Base Service Labour</span>
                <span className="font-mono text-primary font-bold">{formatCurrency(pricingBreakdown.baseAmount)}</span>
              </div>

              {isEmergencyRequested && (
                <div className="flex justify-between text-amber-700 font-semibold">
                  <span>Emergency 2-Hr Surcharge</span>
                  <span className="font-mono">+₹499</span>
                </div>
              )}

              {pricingBreakdown.discountMembership > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>PLUS Membership (20% Off)</span>
                  <span className="font-mono">-₹{pricingBreakdown.discountMembership}</span>
                </div>
              )}

              {pricingBreakdown.discountCoupon > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon ({pricingBreakdown.couponCode})</span>
                  <span className="font-mono">-₹{pricingBreakdown.discountCoupon}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Safety & Sanitation Fee</span>
                <span className="font-mono text-primary">
                  {pricingBreakdown.safetyFee === 0 ? "FREE" : formatCurrency(pricingBreakdown.safetyFee)}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Taxes & GST (18%)</span>
                <span className="font-mono text-primary font-bold">{formatCurrency(pricingBreakdown.taxGst)}</span>
              </div>

              <div className="flex justify-between pt-3 border-t border-border text-sm font-extrabold text-primary">
                <span>Total Amount Payable</span>
                <span className="font-mono text-lg text-[#FF6A00]">
                  {formatCurrency(pricingBreakdown.totalPayableInr)}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-muted/40 text-[11px] text-foreground-muted space-y-1">
              <p className="font-bold text-primary">Home-e-Fix Trust Assurance:</p>
              <p>• 100% price lock guaranteed</p>
              <p>• 30-Day workmanship warranty</p>
              <p>• No extra charge without customer digital approval</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
