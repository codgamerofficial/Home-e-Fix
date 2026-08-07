import { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker, type TimeSlotOption } from "@/components/ui/time-picker";
import { AddressCard } from "@/components/ui/address-card";
import { ProgressTimeline } from "@/components/ui/progress-timeline";
import { ROUTES } from "@/constants/routes";
import { POPULAR_SERVICES } from "@/constants/services";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import { displayRazorpayCheckout } from "@/lib/razorpay";
import { formatCurrency } from "@/lib/utils";

/* ─── Mock User Addresses ─── */

const INITIAL_ADDRESSES: any[] = [
  {
    id: "addr-1",
    title: "Home Address",
    type: "home",
    streetAddress: "Flat 402, Block CD, Salt Lake Sector 1",
    landmark: "Near City Centre 1 Mall",
    city: "Kolkata",
    state: "West Bengal",
    pincode: "700064",
    isDefault: true,
  },
  {
    id: "addr-2",
    title: "Work Office",
    type: "work",
    streetAddress: "Tower 5, Action Area 1, New Town",
    landmark: "Near Eco Park Gateway 2",
    city: "Kolkata",
    state: "West Bengal",
    pincode: "700156",
    isDefault: false,
  },
];

/* ─── Mock Available Coupons ─── */

const COUPONS_MAP: Record<string, { discount: number; type: "fixed" | "percentage"; minBill: number }> = {
  FIRSTFIX100: { discount: 100, type: "fixed", minBill: 299 },
  HOMEEFIX20: { discount: 20, type: "percentage", minBill: 499 },
  VIPPASS: { discount: 150, type: "fixed", minBill: 399 },
};

export default function BookingWizard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { items: cartItems, addItem, removeItem, updateQuantity, clearCart, getSubtotal } = useCartStore();

  // Wizard Stage (0 to 5)
  const [currentStep, setCurrentStep] = useState<number>(0);

  // Selected Service Items fallback
  const selectedServices = cartItems.length > 0 ? cartItems : [POPULAR_SERVICES[0]];

  // Address State
  const [addresses, setAddresses] = useState<any[]>(INITIAL_ADDRESSES);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("addr-1");
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [newAddrForm, setNewAddrForm] = useState({
    title: "Home Address",
    type: "home" as "home" | "work" | "other",
    streetAddress: "",
    landmark: "",
    city: "Hyderabad",
    pincode: "",
  });

  // Schedule State
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState<string>("s2");

  // Problem Details & Photos
  const [problemDescription, setProblemDescription] = useState("");
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([
    "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=300&q=80",
  ]);

  // Coupon State
  const [couponCode, setCouponCode] = useState("FIRSTFIX100");
  const [appliedDiscount, setAppliedDiscount] = useState<number>(100);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "upi" | "card" | "wallet">("upi");

  // Calculation Logic
  const itemsSubtotal = selectedServices.reduce(
    (sum, s: any) => sum + (s.discountedPrice || s.basePrice || 499) * (s.quantity || 1),
    0
  );
  const safetyHygieneFee = 29;
  const taxGst = Math.round(itemsSubtotal * 0.18);
  const totalAmount = Math.max(0, itemsSubtotal + safetyHygieneFee + taxGst - appliedDiscount);

  // Steps Progress Timeline
  const wizardSteps = [
    { title: "Service", status: currentStep > 0 ? "completed" : currentStep === 0 ? "current" : "upcoming" },
    { title: "Address", status: currentStep > 1 ? "completed" : currentStep === 1 ? "current" : "upcoming" },
    { title: "Schedule", status: currentStep > 2 ? "completed" : currentStep === 2 ? "current" : "upcoming" },
    { title: "Details", status: currentStep > 3 ? "completed" : currentStep === 3 ? "current" : "upcoming" },
    { title: "Summary", status: currentStep > 4 ? "completed" : currentStep === 4 ? "current" : "upcoming" },
    { title: "Payment", status: currentStep === 5 ? "current" : "upcoming" },
  ] as const;

  const handleApplyCoupon = () => {
    setCouponError(null);
    const code = couponCode.trim().toUpperCase();
    const c = COUPONS_MAP[code];

    if (!c) {
      setCouponError("Invalid coupon code. Try 'FIRSTFIX100' or 'HOMEEFIX20'");
      setAppliedDiscount(0);
      return;
    }

    if (itemsSubtotal < c.minBill) {
      setCouponError(`Coupon requires a minimum booking subtotal of ${formatCurrency(c.minBill)}`);
      setAppliedDiscount(0);
      return;
    }

    let discountVal = 0;
    if (c.type === "fixed") {
      discountVal = c.discount;
    } else {
      discountVal = Math.round((itemsSubtotal * c.discount) / 100);
    }

    setAppliedDiscount(discountVal);
  };

  const handleAddPhoto = () => {
    const fakePhoto = "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=300&q=80";
    setUploadedPhotos((prev) => [...prev, fakePhoto]);
  };

  const handleCreateAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrForm.streetAddress || !newAddrForm.pincode) return;

    const newAddr: any = {
      id: `addr-${Date.now()}`,
      title: newAddrForm.title,
      type: newAddrForm.type,
      streetAddress: newAddrForm.streetAddress,
      landmark: newAddrForm.landmark,
      city: newAddrForm.city,
      state: "Telangana",
      pincode: newAddrForm.pincode,
      isDefault: false,
    };

    setAddresses((prev) => [...prev, newAddr]);
    setSelectedAddressId(newAddr.id);
    setShowAddAddressModal(false);
  };

  const { user } = useAuthStore();

  const handleConfirmBooking = async () => {
    const bookingId = `HEF-${Math.floor(100000 + Math.random() * 900000)}`;

    // Cash / Pay after service
    if (paymentMethod === "cash") {
      clearCart();
      navigate(`/booking/confirmation/${bookingId}`);
      return;
    }

    // Razorpay Online Gateway Checkout (UPI, Card, Wallet)
    await displayRazorpayCheckout({
      amount: totalAmount,
      currency: "INR",
      name: "Home-e-Fix",
      description: `Home Service Booking #${bookingId}`,
      customerName: user?.fullName || "Valued Customer",
      customerEmail: user?.email || "customer@homeefix.com",
      customerPhone: user?.phone || "+91 98765 43210",
      onSuccess: (paymentId) => {
        clearCart();
        navigate(`/booking/confirmation/${bookingId}?payment_id=${paymentId}`);
      },
      onFailure: (err) => {
        console.error("Razorpay Payment Error:", err);
      },
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* HEADER */}
      <section className="bg-surface border-b border-border py-6">
        <div className="container-app flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (currentStep > 0) setCurrentStep(currentStep - 1);
              else navigate(ROUTES.SERVICES);
            }}
            className="flex items-center gap-2 text-xs font-semibold text-foreground-secondary hover:text-primary transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            {currentStep === 0 ? "Back to Catalog" : "Previous Step"}
          </button>

          <Badge variant="accent" className="px-3 py-1">
            🔒 256-Bit SSL Secure Checkout
          </Badge>
        </div>
      </section>

      {/* STEPPER PROGRESS */}
      <div className="container-app py-6 max-w-4xl">
        <ProgressTimeline steps={wizardSteps as any} orientation="horizontal" />
      </div>

      {/* WIZARD CONTENT BOX */}
      <div className="container-app max-w-4xl">
        <Card className="p-6 sm:p-8 border border-border/80 shadow-lg">
          <AnimatePresence mode="wait">
            {/* ─── STAGE 0: SERVICE SELECTION ─── */}
            {currentStep === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="font-heading text-xl sm:text-2xl font-bold text-primary">
                    1. Review Selected Services
                  </h2>
                  <p className="text-xs text-foreground-secondary mt-1">
                    Confirm your selected items and add recommended spare parts or add-ons.
                  </p>
                </div>

                <div className="space-y-3">
                  {selectedServices.map((service) => (
                    <div
                      key={service.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border bg-surface gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center text-xl shrink-0">
                          🛠️
                        </div>
                        <div>
                          <h4 className="font-heading text-sm font-semibold text-primary">
                            {service.name}
                          </h4>
                          <p className="text-xs text-foreground-secondary">
                            Duration: {service.duration || 45} mins • 30-Day Warranty
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-border">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1.5 border border-border rounded-lg p-1 bg-background">
                          <button
                            type="button"
                            onClick={() => updateQuantity(service.id, -1)}
                            className="h-6 w-6 rounded bg-surface hover:bg-muted text-primary font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold px-2 text-primary">
                            {(service as any).quantity || 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(service.id, 1)}
                            className="h-6 w-6 rounded bg-surface hover:bg-muted text-primary font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        {/* Price Display */}
                        <div className="text-right">
                          <div className="font-heading text-base font-bold text-primary">
                            {formatCurrency((service.discountedPrice || service.basePrice) * ((service as any).quantity || 1))}
                          </div>
                          {service.discountedPrice && service.basePrice > service.discountedPrice && (
                            <span className="text-[11px] text-foreground-muted line-through block">
                              {formatCurrency(service.basePrice * ((service as any).quantity || 1))}
                            </span>
                          )}
                        </div>

                        {/* Delete Service Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(service.id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 h-8 w-8 shrink-0"
                          title="Remove service"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add-ons Box */}
                <div className="rounded-xl border border-dashed border-accent/40 bg-accent/5 p-4 space-y-3">
                  <h4 className="font-heading text-xs font-bold text-accent flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4" /> Recommended Add-ons
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
                      <div>
                        <div className="text-xs font-semibold text-primary">Post-Service Sanitization Spray</div>
                        <div className="text-[10px] text-foreground-secondary">+ ₹49</div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => alert("Sanitization spray added!")}>
                        + Add
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
                      <div>
                        <div className="text-xs font-semibold text-primary">6-Month Extended Warranty</div>
                        <div className="text-[10px] text-foreground-secondary">+ ₹99</div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => alert("Extended warranty added!")}>
                        + Add
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── STAGE 1: ADDRESS SELECTION ─── */}
            {currentStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-heading text-xl sm:text-2xl font-bold text-primary">
                      2. Select Service Address
                    </h2>
                    <p className="text-xs text-foreground-secondary mt-1">
                      Where should our verified professional arrive?
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Plus className="h-4 w-4" />}
                    onClick={() => setShowAddAddressModal(true)}
                  >
                    Add New Address
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className="cursor-pointer"
                    >
                      <AddressCard
                        address={addr}
                        selected={selectedAddressId === addr.id}
                        onSelect={() => setSelectedAddressId(addr.id)}
                      />
                    </div>
                  ))}
                </div>

                {/* Add Address Form Modal */}
                {showAddAddressModal && (
                  <div className="p-4 rounded-xl border border-border bg-surface space-y-4">
                    <h4 className="font-heading text-sm font-bold text-primary">
                      Enter New Address Details
                    </h4>
                    <form onSubmit={handleCreateAddress} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-foreground-secondary">
                            Address Label (Home / Work)
                          </label>
                          <Input
                            value={newAddrForm.title}
                            onChange={(e) => setNewAddrForm({ ...newAddrForm, title: e.target.value })}
                            placeholder="e.g. Home, Parent's House"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-foreground-secondary">
                            Pincode
                          </label>
                          <Input
                            value={newAddrForm.pincode}
                            onChange={(e) => setNewAddrForm({ ...newAddrForm, pincode: e.target.value })}
                            placeholder="500081"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-foreground-secondary">
                          Flat / House No / Building Name
                        </label>
                        <Input
                          value={newAddrForm.streetAddress}
                          onChange={(e) => setNewAddrForm({ ...newAddrForm, streetAddress: e.target.value })}
                          placeholder="Flat 102, Green Valley Apartments"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-foreground-secondary">
                          Street / Area / Landmark
                        </label>
                        <Input
                          value={newAddrForm.landmark}
                          onChange={(e) => setNewAddrForm({ ...newAddrForm, landmark: e.target.value })}
                          placeholder="Near Axis Bank ATM, Madhapur"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <Button variant="ghost" size="sm" onClick={() => setShowAddAddressModal(false)}>
                          Cancel
                        </Button>
                        <Button variant="accent" size="sm" type="submit">
                          Save Address
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </motion.div>
            )}

            {/* ─── STAGE 2: DATE & TIME SLOT ─── */}
            {currentStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="font-heading text-xl sm:text-2xl font-bold text-primary">
                    3. Select Date & Time Slot
                  </h2>
                  <p className="text-xs text-foreground-secondary mt-1">
                    Choose when you want the technician to visit your home.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Date Picker */}
                  <div>
                    <label className="text-xs font-semibold text-foreground-secondary mb-2 block">
                      Preferred Date
                    </label>
                    <DatePicker
                      selectedDate={selectedDate}
                      onSelectDate={setSelectedDate}
                      minDate={new Date()}
                    />
                  </div>

                  {/* Time Slot Picker */}
                  <div>
                    <label className="text-xs font-semibold text-foreground-secondary mb-2 block">
                      Available Time Slots
                    </label>
                    <TimePicker
                      selectedSlotId={selectedTimeSlotId}
                      onSelectSlot={(slot: TimeSlotOption) => setSelectedTimeSlotId(slot.id)}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── STAGE 3: PROBLEM DETAILS & PHOTO UPLOAD ─── */}
            {currentStep === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="font-heading text-xl sm:text-2xl font-bold text-primary">
                    4. Describe Problem & Upload Photos
                  </h2>
                  <p className="text-xs text-foreground-secondary mt-1">
                    Helping our technician bring the right tools & spare parts.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground-secondary mb-1 block">
                      Problem Details / Specific Instructions
                    </label>
                    <textarea
                      value={problemDescription}
                      onChange={(e) => setProblemDescription(e.target.value)}
                      rows={3}
                      placeholder="e.g. AC is leaking water from the left side and making a rattling sound..."
                      className="w-full rounded-xl border border-border bg-background p-3 text-xs text-primary focus:outline-hidden focus:ring-2 focus:ring-accent"
                    />
                  </div>

                  {/* Photo Uploader */}
                  <div>
                    <label className="text-xs font-semibold text-foreground-secondary mb-2 block">
                      Attach Photos (Optional)
                    </label>
                    <div className="flex flex-wrap items-center gap-3">
                      {uploadedPhotos.map((photo, idx) => (
                        <div key={idx} className="relative h-20 w-20 rounded-xl overflow-hidden border border-border group">
                          <img src={photo} alt="Issue" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setUploadedPhotos((prev) => prev.filter((_, i) => i !== idx))}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={handleAddPhoto}
                        className="h-20 w-20 rounded-xl border-2 border-dashed border-border hover:border-accent flex flex-col items-center justify-center gap-1 text-foreground-muted hover:text-accent transition-colors cursor-pointer"
                      >
                        <Upload className="h-5 w-5" />
                        <span className="text-[10px] font-semibold">Upload</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── STAGE 4: SUMMARY & COUPON ─── */}
            {currentStep === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="font-heading text-xl sm:text-2xl font-bold text-primary">
                    5. Price Breakdown & Coupon
                  </h2>
                  <p className="text-xs text-foreground-secondary mt-1">
                    Review your itemized invoice before payment.
                  </p>
                </div>

                {/* Coupon Input Box */}
                <div className="rounded-xl border border-border bg-surface p-4 space-y-2">
                  <label className="text-xs font-semibold text-foreground-secondary flex items-center gap-1.5">
                    <Tag className="h-4 w-4 text-accent" /> Have a Coupon Code?
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="e.g. FIRSTFIX100"
                      className="uppercase"
                    />
                    <Button variant="accent" size="sm" onClick={handleApplyCoupon}>
                      Apply
                    </Button>
                  </div>
                  {couponError && (
                    <div className="text-[11px] text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" /> {couponError}
                    </div>
                  )}
                  {appliedDiscount > 0 && !couponError && (
                    <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5" /> Coupon Applied! Saved {formatCurrency(appliedDiscount)}
                    </div>
                  )}
                </div>

                {/* Itemized Invoice Box */}
                <div className="rounded-xl border border-border bg-surface p-5 space-y-3 text-xs">
                  <h4 className="font-heading text-sm font-bold text-primary pb-2 border-b border-border">
                    Payment Summary
                  </h4>

                  <div className="flex justify-between text-foreground-secondary">
                    <span>Service Subtotal ({selectedServices.length} items)</span>
                    <span>{formatCurrency(itemsSubtotal)}</span>
                  </div>

                  <div className="flex justify-between text-foreground-secondary">
                    <span>Safety & Hygiene Fee</span>
                    <span>{formatCurrency(safetyHygieneFee)}</span>
                  </div>

                  <div className="flex justify-between text-foreground-secondary">
                    <span>Taxes & GST (18%)</span>
                    <span>{formatCurrency(taxGst)}</span>
                  </div>

                  {appliedDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Coupon Discount</span>
                      <span>- {formatCurrency(appliedDiscount)}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-border flex justify-between font-heading text-base font-bold text-primary">
                    <span>Total Amount Payable</span>
                    <span className="text-accent">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── STAGE 5: PAYMENT SELECTION ─── */}
            {currentStep === 5 && (
              <motion.div
                key="step-5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="font-heading text-xl sm:text-2xl font-bold text-primary">
                    6. Choose Payment Method
                  </h2>
                  <p className="text-xs text-foreground-secondary mt-1">
                    Select how you want to pay for your service.
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      id: "cash",
                      title: "Pay After Service (Cash / UPI)",
                      subtitle: "Inspect the completed job, then pay technician directly",
                      icon: ShieldCheck,
                    },
                    {
                      id: "upi",
                      title: "Instant UPI (Google Pay, PhonePe, Paytm)",
                      subtitle: "Pay now via UPI QR code or VPA ID",
                      icon: Sparkles,
                    },
                    {
                      id: "card",
                      title: "Credit / Debit Card",
                      subtitle: "Visa, MasterCard, RuPay cards supported",
                      icon: CreditCard,
                    },
                    {
                      id: "wallet",
                      title: "Home-e-Fix Wallet (Balance: ₹500)",
                      subtitle: "Fastest 1-tap checkout from your wallet",
                      icon: Wallet,
                    },
                  ].map((method) => {
                    const Icon = method.icon;
                    const isSelected = paymentMethod === method.id;

                    return (
                      <div
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id as any)}
                        className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? "border-accent bg-accent/5 ring-2 ring-accent/30"
                            : "border-border bg-surface hover:border-accent/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <Icon className="h-5 w-5 text-accent" />
                          </div>
                          <div>
                            <h4 className="font-heading text-xs font-bold text-primary">
                              {method.title}
                            </h4>
                            <p className="text-[11px] text-foreground-secondary">
                              {method.subtitle}
                            </p>
                          </div>
                        </div>

                        <div
                          className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                            isSelected ? "border-accent bg-accent text-white" : "border-border"
                          }`}
                        >
                          {isSelected && <CheckCircle className="h-3.5 w-3.5" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* WIZARD BOTTOM ACTIONS */}
          <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (currentStep > 0) setCurrentStep(currentStep - 1);
              }}
              disabled={currentStep === 0}
            >
              Back
            </Button>

            {currentStep < 5 ? (
              <Button
                variant="accent"
                size="sm"
                rightIcon={<ArrowRight className="h-4 w-4" />}
                onClick={() => setCurrentStep(currentStep + 1)}
              >
                Continue to Next Step
              </Button>
            ) : (
              <Button
                variant="accent"
                size="lg"
                rightIcon={<CheckCircle className="h-5 w-5" />}
                onClick={handleConfirmBooking}
                className="font-bold shadow-glow"
              >
                Confirm & Book Service ({formatCurrency(totalAmount)})
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
