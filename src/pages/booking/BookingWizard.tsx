import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams, useParams, Link } from "react-router";
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
  ChevronUp,
  ChevronDown,
  X,
  Info,
  Edit2,
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
import { useBookingDraftStore, type BookingItemDraft } from "@/store/booking.store";
import { displayRazorpayCheckout } from "@/lib/razorpay";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import { dbRepository, DEFAULT_PRICING_CONFIG } from "@/services/db/repository";
import { pricingEngine } from "@/services/marketplace/pricing.engine";
import { serviceabilityEngine } from "@/services/marketplace/serviceability.engine";
import { slotEngine } from "@/services/marketplace/slot.engine";
import { paymentOrchestrator } from "@/lib/payments/orchestrator";
import { catalogueEngine } from "@/services/marketplace/catalogue.engine";
import { useCustomerAddresses } from "@/hooks/useCustomerAddresses";
import { AddressFormModal } from "@/components/booking/AddressFormModal";
import { bookingsApi } from "@/services/api/bookings.api";
import { analyticsService } from "@/services/analytics/analytics.service";
import { isServiceConfigured } from "@/config/env";
import type { Address, AddressSnapshot } from "@/types/address.types";
import type { ArchitecturalService, ServiceDiagnosticQuestion, QuestionOption } from "@/types/service-architecture.types";

export default function BookingWizard() {
  const navigate = useNavigate();
  const { service: paramServiceSlug } = useParams<{ service?: string }>();
  const [searchParams] = useSearchParams();
  const fromCart = searchParams.get("fromCart") === "true";
  const queryServiceSlug = searchParams.get("service");
  const requestedServiceSlug = paramServiceSlug || queryServiceSlug;

  const { items: cartItems, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const {
    draft,
    setSingleServiceDraft,
    setCartDraft,
    updateDraft,
    clearDraft,
    ensureIdempotencyKey,
  } = useBookingDraftStore();

  // Wizard Stage (0 to 5)
  const [currentStep, setCurrentStep] = useState<number>(0);

  // Initialize booking draft:
  // If requestedServiceSlug is present, strictly isolate to that single service.
  // If fromCart=true, load all cartItems into draft.
  // Otherwise, use existing draft, or fall back to cart items if any, or default service.
  useEffect(() => {
    if (requestedServiceSlug) {
      const match: any =
        catalogueEngine.getServiceBySlug(requestedServiceSlug) ||
        POPULAR_SERVICES.find((s) => s.slug === requestedServiceSlug);

      if (match) {
        setSingleServiceDraft(match, 1);
      } else {
        setSingleServiceDraft(POPULAR_SERVICES[0], 1);
      }
    } else if (fromCart && cartItems.length > 0) {
      setCartDraft(cartItems);
    } else if (!draft || !draft.items || draft.items.length === 0) {
      if (cartItems.length > 0) {
        setCartDraft(cartItems);
      } else {
        setSingleServiceDraft(POPULAR_SERVICES[0], 1);
      }
    }
  }, [fromCart, requestedServiceSlug, cartItems.length]);

  const bookingItems: BookingItemDraft[] = useMemo(() => {
    // If a direct service booking was requested via URL, strictly isolate calculation to it alone
    if (requestedServiceSlug) {
      const match: any =
        catalogueEngine.getServiceBySlug(requestedServiceSlug) ||
        POPULAR_SERVICES.find((s) => s.slug === requestedServiceSlug);
      if (match) {
        return [
          {
            serviceId: match.id,
            serviceSlug: match.slug,
            serviceName: match.name,
            categorySlug: match.category?.slug || match.missionCategory || "electrical",
            unitPrice: match.discountedPrice ?? match.basePrice ?? 499,
            quantity: 1,
            quantityUnit: "unit",
            pricingType: "fixed" as const,
            materialsPolicy: "extra" as const,
            warrantyDays: match.warrantyDays ?? 30,
            duration: match.durationMinutes || match.duration || 45,
            subtotal: match.discountedPrice ?? match.basePrice ?? 499,
          },
        ];
      }
    }

    if (draft?.items && draft.items.length > 0) {
      return draft.items;
    }

    return [
      {
        serviceId: POPULAR_SERVICES[0].id,
        serviceSlug: POPULAR_SERVICES[0].slug,
        serviceName: POPULAR_SERVICES[0].name,
        categorySlug: POPULAR_SERVICES[0].category.slug,
        unitPrice: POPULAR_SERVICES[0].discountedPrice || POPULAR_SERVICES[0].basePrice,
        quantity: 1,
        quantityUnit: "unit",
        pricingType: "fixed" as const,
        materialsPolicy: "extra" as const,
        warrantyDays: 30,
        duration: (POPULAR_SERVICES[0] as any).durationMinutes || (POPULAR_SERVICES[0] as any).duration || 45,
        subtotal: POPULAR_SERVICES[0].discountedPrice || POPULAR_SERVICES[0].basePrice,
      },
    ];
  }, [draft?.items, requestedServiceSlug]);

  const primaryService = bookingItems[0];
  const categorySlug = primaryService?.categorySlug || "ac";

  // Architectural Service lookup
  const architecturalService: ArchitecturalService = useMemo(() => {
    const slug = primaryService?.serviceSlug || "";
    return (
      catalogueEngine.getServiceBySlug(slug) ||
      catalogueEngine.ARCHITECTURAL_SERVICES.find(
        (s: ArchitecturalService) => s.missionCategory === categorySlug || s.slug.includes(categorySlug)
      ) ||
      catalogueEngine.ARCHITECTURAL_SERVICES[0]
    );
  }, [primaryService, categorySlug]);

  useEffect(() => {
    analyticsService.trackEvent("booking_started", {
      serviceSlug: primaryService?.serviceSlug,
      serviceName: primaryService?.serviceName,
      categorySlug,
      isEmergency: isEmergencyRequested,
    });
  }, [primaryService?.serviceSlug]);

  // Category-Specific Questions State
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, string>>({
    ac_tonnage: "1.5 Ton (Most Common)",
    ac_type: "Split AC (High-wall)",
    plumbing_fixture: "Bathroom washbasin",
    cleaning_bhk: "2 BHK Apartment",
    electrician_issue: "Switchboard / Socket burning",
  });

  // Section 15: Emergency / Priority dispatch removed unless backend dispatch SLA is implemented
  const isEmergencyRequested = false;

  // Address State (Loaded via TanStack Query from Supabase / DB repository)
  const {
    addresses: savedAddresses,
    isLoading: isAddressesLoading,
    deleteAddress: deleteSavedAddress,
  } = useCustomerAddresses();

  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Auto-select default or first address when loaded
  useEffect(() => {
    if (savedAddresses.length > 0) {
      const exists = savedAddresses.some((a) => a.id === selectedAddressId);
      if (!selectedAddressId || !exists) {
        const def = savedAddresses.find((a) => a.is_default || a.isDefault);
        setSelectedAddressId(def ? def.id : savedAddresses[0].id);
      }
    } else {
      setSelectedAddressId("");
    }
  }, [savedAddresses, selectedAddressId]);

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
  const [showMobilePriceSheet, setShowMobilePriceSheet] = useState(false);

  // Active Address & Kolkata-Wide Serviceability Check
  const currentAddress = savedAddresses.find((a) => a.id === selectedAddressId) || savedAddresses[0];
  const serviceability = useMemo(() => {
    if (!currentAddress) {
      return serviceabilityEngine.checkServiceability({
        city: "Kolkata",
        state: "West Bengal",
        postalCode: "700001",
        isEmergencyRequested,
      });
    }

    return serviceabilityEngine.checkServiceability({
      city: currentAddress.city,
      state: currentAddress.state,
      postalCode: currentAddress.postal_code || currentAddress.pincode,
      pincode: currentAddress.postal_code || currentAddress.pincode,
      latitude: currentAddress.latitude,
      longitude: currentAddress.longitude,
      isEmergencyRequested,
    });
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

  // Active Pricing Configuration from DB repository
  const activePricingConfig = useMemo(() => {
    try {
      return dbRepository.getPricingConfig?.() || DEFAULT_PRICING_CONFIG;
    } catch {
      return DEFAULT_PRICING_CONFIG;
    }
  }, []);

  // Pricing Calculation via Engine - strictly isolated from global cart
  const baseLaborPrice = useMemo(() => {
    return bookingItems.reduce(
      (sum, item) => sum + item.unitPrice * Math.max(1, item.quantity),
      0
    );
  }, [bookingItems]);

  // Real, truthful PLUS membership check
  const isPlusMember = useMemo(() => {
    if (!user?.id) return false;
    const sub = dbRepository.getMembership(user.id);
    return Boolean(
      sub &&
      sub.status === "ACTIVE" &&
      new Date(sub.endDate || sub.end_date || 0).getTime() > Date.now()
    );
  }, [user?.id]);

  const activeSlot = generatedSlots.find((s) => s.slotId === selectedSlotId);
  const isNightSlot = !isEmergencyRequested && Boolean(activeSlot && (activeSlot.startHour >= 20 || activeSlot.endHour > 20));

  const pricingBreakdown = useMemo(() => {
    return pricingEngine.calculate({
      items: bookingItems.map((item) => ({
        serviceId: item.serviceId,
        serviceName: item.serviceName,
        basePrice: item.unitPrice,
        variantPrice: item.unitPrice,
        quantity: item.quantity,
      })),
      basePrice: baseLaborPrice,
      quantity: 1,
      isEmergency: isEmergencyRequested,
      isNightSlot,
      couponCode: couponNotice.valid ? couponCode : undefined,
      isPlusMember,
    });
  }, [bookingItems, baseLaborPrice, isEmergencyRequested, isNightSlot, couponCode, couponNotice, isPlusMember]);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const res = pricingEngine.validateCoupon(couponCode, pricingBreakdown.subtotal);
    setCouponNotice({ valid: res.valid, message: res.message });
  };

  const handleAddressSaved = (savedAddr: Address) => {
    setSelectedAddressId(savedAddr.id);
    setIsAddressModalOpen(false);
    setEditingAddress(null);
  };

  const handleConfirmBooking = async () => {
    if (!currentAddress) {
      setPaymentErrorNotice("Please add or select a service delivery address.");
      return;
    }

    if (!serviceability.isServiceable) {
      setPaymentErrorNotice("Home-e-Fix is not currently available at this location.");
      return;
    }

    setIsSubmitting(true);
    setPaymentErrorNotice(null);

    try {
      const activeSlot = generatedSlots.find((s) => s.slotId === selectedSlotId);
      const slotLabel = activeSlot ? activeSlot.timeRangeLabel : "09:00 AM - 11:00 AM";

      const addressSnapshot: AddressSnapshot = {
        id: currentAddress.id,
        full_name: currentAddress.full_name || currentAddress.recipient_name || user?.fullName || "Valued Customer",
        phone: currentAddress.phone || currentAddress.recipient_phone || user?.phone || "9830000000",
        house_flat: currentAddress.house_flat || currentAddress.address_line_1 || currentAddress.streetAddress || "",
        building: currentAddress.building || null,
        street: currentAddress.street || currentAddress.address_line_1 || currentAddress.streetAddress || "",
        area: currentAddress.area || currentAddress.locality || "Kolkata",
        landmark: currentAddress.landmark || null,
        city: currentAddress.city || "Kolkata",
        state: currentAddress.state || "West Bengal",
        country: currentAddress.country || "India",
        postal_code: currentAddress.postal_code || currentAddress.pincode || "700001",
        latitude: currentAddress.latitude || null,
        longitude: currentAddress.longitude || null,
        formatted_address:
          currentAddress.formatted_address ||
          currentAddress.fullAddress ||
          `${currentAddress.streetAddress || currentAddress.house_flat || ""}, ${currentAddress.city} - ${currentAddress.pincode}`,
        label: currentAddress.label || "HOME",
      };

      const idempotencyKey = ensureIdempotencyKey();

      const createdBooking = await bookingsApi.createBooking({
        bookingNumber: `HEF-${Date.now().toString().slice(-6)}`,
        serviceId: primaryService.serviceId || (primaryService as any).id,
        serviceName: primaryService.serviceName || (primaryService as any).name,
        categorySlug: categorySlug,
        customerName: addressSnapshot.full_name,
        customerPhone: addressSnapshot.phone,
        scheduledDate: formatDate(selectedDate || new Date()),
        scheduledTimeSlot: slotLabel,
        totalAmount: pricingBreakdown.totalPayableInr,
        subtotal: pricingBreakdown.subtotal,
        taxGst: pricingBreakdown.taxGst,
        safetyFee: pricingBreakdown.safetyFee,
        discount: pricingBreakdown.discountCoupon + pricingBreakdown.discountMembership,
        paymentMethod: paymentMethod.toUpperCase(),
        address: addressSnapshot.formatted_address,
        addressSnapshot,
        serviceAnswers: questionAnswers,
        items: bookingItems.map((item) => ({
          serviceId: item.serviceId,
          serviceName: item.serviceName,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          pricingType: item.pricingType,
          materialsPolicy: item.materialsPolicy,
          subtotal: item.subtotal,
        })),
        pricingSnapshot: pricingBreakdown,
      });

      // If Razorpay online payment selected
      if (paymentMethod === "upi" || paymentMethod === "card") {
        try {
          await displayRazorpayCheckout({
            amount: pricingBreakdown.totalPayableInr,
            bookingId: createdBooking.id,
            purpose: "BOOKING",
            name: "Home-e-Fix",
            description: `${primaryService.serviceName} Booking`,
            customerName: user?.fullName || "Valued Customer",
            customerEmail: user?.email || "customer@homeefix.in",
            customerPhone: user?.phone || "9830000000",
            onSuccess: (paymentId: string) => {
              dbRepository.updateBookingStatus(createdBooking.id, "CONFIRMED", `Payment verified via Razorpay: ${paymentId}`);
              if (fromCart || draft?.source === "cart") {
                clearCart();
              }
              clearDraft();
              navigate(`/booking/confirmation/${createdBooking.booking_number}`);
            },
            onCancel: () => {
              setPaymentErrorNotice("Payment window closed. Your booking is placed with pending payment status.");
              if (fromCart || draft?.source === "cart") {
                clearCart();
              }
              clearDraft();
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
      if (fromCart || draft?.source === "cart") {
        clearCart();
      }
      clearDraft();
      navigate(`/booking/confirmation/${createdBooking.booking_number}`);
    } catch (err: any) {
      setPaymentErrorNotice(err.message || "Failed to create booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Payment Gateway Configuration Check
  const isPaymentGatewayConfigured = isServiceConfigured("razorpay");
  const totalSteps = isPaymentGatewayConfigured ? 6 : 5;

  // Steps Progress - dynamically adapts (5 steps if no gateway, 6 if gateway configured)
  const wizardSteps = useMemo(() => {
    const steps = [
      { title: "Service", status: currentStep > 0 ? "completed" : currentStep === 0 ? "current" : "upcoming" },
      { title: "Questions", status: currentStep > 1 ? "completed" : currentStep === 1 ? "current" : "upcoming" },
      { title: "Address", status: currentStep > 2 ? "completed" : currentStep === 2 ? "current" : "upcoming" },
      { title: "Slot", status: currentStep > 3 ? "completed" : currentStep === 3 ? "current" : "upcoming" },
      { title: "Summary", status: currentStep > 4 ? "completed" : currentStep === 4 ? "current" : "upcoming" },
    ];
    if (isPaymentGatewayConfigured) {
      steps.push({ title: "Payment", status: currentStep === 5 ? "current" : "upcoming" } as any);
    }
    return steps;
  }, [currentStep, isPaymentGatewayConfigured]);

  const stepTitles = useMemo(() => {
    const titles = [
      "Select Service Package",
      "Diagnosis Questions",
      "Service Address",
      "Date & Time Slot",
      "Review & Summary",
    ];
    if (isPaymentGatewayConfigured) {
      titles.push("Select Payment");
    }
    return titles;
  }, [isPaymentGatewayConfigured]);

  return (
    <div className="container-app py-5 sm:py-8 pb-32 lg:pb-12 max-w-4xl space-y-5 sm:space-y-8">
      {/* Mobile Top Step Indicator Bar (< sm) */}
      <div className="sm:hidden space-y-2.5">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => (currentStep > 0 ? setCurrentStep(currentStep - 1) : navigate(-1))}
            className="min-touch-target p-1.5 -ml-1.5 flex items-center gap-1 text-xs font-semibold text-foreground-secondary hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{currentStep > 0 ? "Back" : "Exit"}</span>
          </button>
          <span className="text-[11px] font-bold text-accent tracking-wider uppercase">
            Step {currentStep + 1} of {totalSteps}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-lg font-bold text-primary truncate">
            {stepTitles[currentStep] || "Booking Step"}
          </h1>
          <Badge variant="secondary" className="bg-[#FF6A00]/10 text-[#FF6A00] font-bold text-[10px] shrink-0">
            {bookingItems.every((i) => i.pricingType === "fixed") ? "Fixed Price" : "Labour Pricing"}
          </Badge>
        </div>
        {/* Step Progress Bar */}
        <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#FF6A00] transition-all duration-300 rounded-full"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop Top Header (sm and up) */}
      <div className="hidden sm:flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-extrabold text-primary">
              Book Home Service
            </h1>
            <Badge variant="secondary" className="bg-[#FF6A00]/10 text-[#FF6A00] font-bold text-[10px]">
              {bookingItems.every((i) => i.pricingType === "fixed") ? "Fixed Service Rate" : "Labour Pricing • Parts Extra"}
            </Badge>
          </div>
          <p className="text-xs text-foreground-secondary mt-1">
            {currentAddress
              ? (serviceability.isServiceable
                  ? `Service available in ${currentAddress.locality || currentAddress.city || "your confirmed area"}`
                  : `Service not currently available in ${currentAddress.locality || currentAddress.city || "your selected area"}`)
              : "Service availability depends on your confirmed location"}
          </p>
        </div>

        <Button variant="ghost" size="sm" asChild>
          <button type="button" onClick={() => navigate(-1)} className="text-xs gap-1.5 cursor-pointer">
            <ArrowLeft className="h-4 w-4" /> Go Back
          </button>
        </Button>
      </div>

      {/* Desktop Progress Timeline */}
      <div className="hidden sm:block">
        <ProgressTimeline steps={wizardSteps as any} />
      </div>

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

              {bookingItems.length === 1 ? (
                <div className="flex items-start justify-between p-4 rounded-2xl bg-muted/40 border border-border">
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-primary">{primaryService.serviceName}</h3>
                    <p className="text-xs text-foreground-secondary">
                      Service appointment
                    </p>
                    <div className="flex items-center gap-2 pt-2 text-[11px] text-foreground-muted flex-wrap">
                      <span>⏱️ {primaryService?.duration ? `${primaryService.duration} mins` : (architecturalService as any)?.estimatedTime || "30-45 mins"}</span>
                      {Boolean(primaryService?.materialsPolicy === "extra" || (architecturalService as any)?.requiresMaterials) && (
                        <>
                          <span>•</span>
                          <span>Labour Charge (Parts extra if needed)</span>
                        </>
                      )}
                      {Boolean(primaryService?.warrantyDays && primaryService.warrantyDays > 0) && (
                        <>
                          <span>•</span>
                          <span className="text-success font-bold">🛡️ {primaryService.warrantyDays}-Day Warranty</span>
                        </>
                      )}
                    </div>
                  </div>
                  <span className="font-mono font-bold text-lg text-[#FF6A00]">
                    {formatCurrency(primaryService.unitPrice * primaryService.quantity)}
                  </span>
                </div>
              ) : (
                <div className="space-y-3 p-4 rounded-2xl bg-muted/40 border border-border">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">
                      Cart Package ({bookingItems.length} Services)
                    </span>
                    <span className="font-mono font-bold text-sm text-[#FF6A00]">
                      Subtotal: {formatCurrency(baseLaborPrice)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {bookingItems.map((item, idx) => (
                      <div key={item.serviceId || idx} className="flex items-center justify-between text-xs py-1">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground font-mono">#{idx + 1}</span>
                          <span className="font-medium text-primary">{item.serviceName}</span>
                          {item.quantity > 1 && (
                            <span className="text-muted-foreground">× {item.quantity}</span>
                          )}
                        </div>
                        <span className="font-mono font-bold text-foreground">
                          {formatCurrency(item.unitPrice * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                <div className="flex items-center justify-between">
                  <h2 className="font-heading text-lg font-bold text-primary flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-accent" /> Service Diagnosis Questions
                  </h2>
                  <Badge variant="outline" className="text-[10px] font-mono border-primary/20 text-primary">
                    {architecturalService.deliveryType}
                  </Badge>
                </div>
                <p className="text-xs text-foreground-secondary mt-1">
                  Help the technician arrive with the exact replacement materials and diagnostic equipment
                </p>
              </div>

              {architecturalService.questions && architecturalService.questions.length > 0 ? (
                <div className="space-y-4 text-xs">
                  {architecturalService.questions.map((q: ServiceDiagnosticQuestion) => (
                    <div key={q.id} className="space-y-1.5 p-3 rounded-xl bg-muted/20 border border-border">
                      <label className="font-bold text-primary block">
                        {q.question}
                        {q.required && <span className="text-destructive ml-1">*</span>}
                      </label>
                      {q.helperText && (
                        <p className="text-[11px] text-foreground-muted">{q.helperText}</p>
                      )}

                      {q.type === "SINGLE_CHOICE" && q.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {q.options.map((opt: QuestionOption) => {
                            const isSelected = questionAnswers[q.code] === opt.id || questionAnswers[q.code] === opt.label;
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => setQuestionAnswers({ ...questionAnswers, [q.code]: opt.id })}
                                className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                                  isSelected
                                    ? "border-accent bg-accent/5 font-bold text-primary shadow-xs"
                                    : "border-border bg-surface text-foreground-secondary hover:border-accent/40"
                                }`}
                              >
                                <span>{opt.label}</span>
                                {opt.priceModifier ? (
                                  <span className="text-[11px] text-accent font-mono font-bold">
                                    +{formatCurrency(opt.priceModifier)}
                                  </span>
                                ) : null}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {q.type === "NUMBER_STEPPER" && (
                        <div className="flex items-center gap-3 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              const currentVal = Number(questionAnswers[q.code]) || q.minNumber || 1;
                              const nextVal = Math.max(q.minNumber || 1, currentVal - (q.step || 1));
                              setQuestionAnswers({ ...questionAnswers, [q.code]: String(nextVal) });
                            }}
                            className="w-8 h-8 rounded-lg border border-border bg-surface font-bold text-sm hover:bg-muted flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="font-mono font-bold text-sm min-w-10 text-center">
                            {questionAnswers[q.code] || q.minNumber || 1} {q.unitLabel || ""}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const currentVal = Number(questionAnswers[q.code]) || q.minNumber || 1;
                              const nextVal = Math.min(q.maxNumber || 20, currentVal + (q.step || 1));
                              setQuestionAnswers({ ...questionAnswers, [q.code]: String(nextVal) });
                            }}
                            className="w-8 h-8 rounded-lg border border-border bg-surface font-bold text-sm hover:bg-muted flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      )}

                      {q.type === "TEXT_INPUT" && (
                        <Input
                          placeholder={q.helperText || "Enter details..."}
                          value={questionAnswers[q.code] || ""}
                          onChange={(e) => setQuestionAnswers({ ...questionAnswers, [q.code]: e.target.value })}
                          className="text-xs mt-1"
                        />
                      )}
                    </div>
                  ))}
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
                    Select delivery address to confirm Kolkata serviceability & dispatch
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingAddress(null);
                    setIsAddressModalOpen(true);
                  }}
                  className="text-xs gap-1 font-bold"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Address
                </Button>
              </div>

              {/* Address Cards */}
              {savedAddresses.length === 0 ? (
                <div className="p-8 rounded-2xl border border-dashed border-border text-center space-y-3 bg-muted/20">
                  <MapPin className="h-8 w-8 text-foreground-muted mx-auto" />
                  <p className="font-bold text-sm text-primary">No saved addresses found</p>
                  <p className="text-xs text-foreground-secondary max-w-sm mx-auto">
                    Please add your service delivery address in Kolkata to verify local serviceability and dispatch slots.
                  </p>
                  <Button
                    variant="accent"
                    size="sm"
                    onClick={() => {
                      setEditingAddress(null);
                      setIsAddressModalOpen(true);
                    }}
                    className="gap-1.5 font-bold"
                  >
                    <Plus className="h-4 w-4" /> Add Service Address
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {savedAddresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    const tag = (addr.label || addr.title || "HOME").toUpperCase();
                    return (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? "border-accent bg-accent/5 ring-2 ring-accent/20 shadow-xs"
                            : "border-border bg-surface hover:border-slate-300"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold tracking-wider uppercase bg-primary/10 text-primary">
                              {tag}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {isSelected && <CheckCircle2 className="h-4 w-4 text-[#FF6A00]" />}
                            </div>
                          </div>

                          {(addr.full_name || addr.recipient_name) && (
                            <p className="font-bold text-xs text-primary mt-2">
                              {addr.full_name || addr.recipient_name}
                              {addr.phone ? ` • ${addr.phone}` : ""}
                            </p>
                          )}

                          <p className="text-xs text-foreground-secondary mt-1 leading-relaxed">
                            {addr.house_flat || addr.streetAddress || ""}
                            {addr.building ? `, ${addr.building}` : ""}
                            {addr.street && addr.street !== addr.house_flat ? `, ${addr.street}` : ""}
                          </p>
                          <p className="text-xs text-foreground-secondary font-medium">
                            {addr.area || addr.locality || ""}, {addr.city} - {addr.postal_code || addr.pincode}
                          </p>
                          {addr.landmark && (
                            <p className="text-[11px] text-foreground-muted mt-0.5">
                              Landmark: {addr.landmark}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/60">
                          <span className="text-[11px] text-foreground-muted font-medium">
                            {addr.is_default || addr.isDefault ? "Default Address" : ""}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingAddress(addr);
                                setIsAddressModalOpen(true);
                              }}
                              className="text-[11px] font-bold text-primary hover:text-accent flex items-center gap-1 min-touch-target px-1.5 py-1 cursor-pointer"
                            >
                              <Edit2 className="h-3 w-3" /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={async (e) => {
                                e.stopPropagation();
                                await deleteSavedAddress(addr.id);
                              }}
                              className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 min-touch-target px-1.5 py-1 cursor-pointer"
                            >
                              <Trash2 className="h-3 w-3" /> Delete
                            </button>
                          </div>
                        </div>
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
                  <p className="font-bold text-sm">
                    {serviceability.isServiceable ? "Service Available" : "Out of Service Zone"}
                  </p>
                  <p className="mt-0.5 leading-relaxed font-medium">
                    {serviceability.isServiceable
                      ? "Home-e-Fix currently serves all areas across Kolkata."
                      : (serviceability.reason || "Currently available in Kolkata only.")}
                  </p>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-border">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>Back</Button>
                <Button
                  variant="accent"
                  disabled={!serviceability.isServiceable || !currentAddress}
                  onClick={() => setCurrentStep(3)}
                  className="gap-2 font-bold"
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
                          <div className="flex items-center gap-1.5">
                            {slot.endHour > 20 && (
                              <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-1.5 py-0.5 rounded-md">
                                +₹150 Night
                              </span>
                            )}
                            {isSelected && <CheckCircle2 className="h-4 w-4 text-[#FF6A00]" />}
                          </div>
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

              {/* PLUS Membership Notice & Upsell */}
              {isPlusMember ? (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-300 text-emerald-900 flex items-center gap-2 text-xs font-bold">
                  <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Home-e-Fix PLUS Member: 20% discount applied on eligible labour charges!</span>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-300 text-amber-950 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>Join Home-e-Fix PLUS to save 20% on labour charges</span>
                  </div>
                  <Button variant="outline" size="sm" asChild className="text-[11px] h-7 px-2.5 font-bold shrink-0">
                    <Link to={ROUTES.APP_MEMBERSHIP}>Explore PLUS</Link>
                  </Button>
                </div>
              )}

              <div className="flex justify-between pt-4 border-t border-border">
                <Button variant="outline" onClick={() => setCurrentStep(3)}>Back</Button>
                {isPaymentGatewayConfigured ? (
                  <Button variant="accent" onClick={() => setCurrentStep(5)} className="gap-2">
                    Proceed to Payment <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    variant="accent"
                    size="lg"
                    disabled={isSubmitting}
                    onClick={handleConfirmBooking}
                    className="shadow-glow gap-2"
                  >
                    {isSubmitting ? "Placing Booking..." : `Confirm Booking • ${formatCurrency(pricingBreakdown.totalPayableInr)}`}
                  </Button>
                )}
              </div>
            </Card>
          )}

          {/* STEP 5: PAYMENT SELECTION (Conditional on Real Payment Gateway Configured) */}
          {isPaymentGatewayConfigured && currentStep === 5 && (
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

        {/* Right 1 Column: Authoritative Bill Breakdown (Desktop) */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-24 rounded-3xl border border-border bg-surface p-6 shadow-sm space-y-4">
            <h3 className="font-heading text-sm font-bold text-primary uppercase tracking-wider">
              {isPaymentGatewayConfigured ? "Payment Breakdown" : "Price Summary"}
            </h3>

            <div className="space-y-2.5 text-xs text-foreground-secondary border-t border-border pt-4">
              <div className="flex justify-between">
                <span>Base Service Labour</span>
                <span className="font-mono text-primary font-bold">{formatCurrency(pricingBreakdown.baseAmount)}</span>
              </div>

              {bookingItems.length > 1 && (
                <div className="pl-2 space-y-1 border-l-2 border-border/60 my-1 text-[11px] text-foreground-muted">
                  {bookingItems.map((item, idx) => (
                    <div key={item.serviceId || idx} className="flex justify-between">
                      <span className="truncate max-w-42.5">{item.serviceName} ({item.quantity})</span>
                      <span className="font-mono">{formatCurrency(item.unitPrice * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              )}

              {pricingBreakdown.materialsAmount > 0 && (
                <div className="flex justify-between">
                  <span>Materials & Parts (at actuals)</span>
                  <span className="font-mono text-primary font-bold">
                    {formatCurrency(pricingBreakdown.materialsAmount)}
                  </span>
                </div>
              )}

              {Boolean(pricingBreakdown.nightFee && pricingBreakdown.nightFee > 0) && (
                <div className="flex justify-between text-indigo-700 dark:text-indigo-400 font-semibold">
                  <span>Night Surcharge (Post 8 PM)</span>
                  <span className="font-mono">+{formatCurrency(pricingBreakdown.nightFee)}</span>
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

              {pricingBreakdown.safetyFee > 0 && (
                <div className="flex justify-between">
                  <span>Safety & Equipment Fee</span>
                  <span className="font-mono text-primary font-bold">
                    {formatCurrency(pricingBreakdown.safetyFee)}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span>{activePricingConfig?.taxLabel || "Taxes & GST"}</span>
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
              <p className="font-bold text-primary">Home-e-Fix Service Standards:</p>
              <p>• Transparent pricing with itemized bill breakdown</p>
              <p>• Verified booking confirmation and dedicated support</p>
              <p>• 30-day workmanship re-work guarantee on completed repairs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Persistent Mobile Bottom CTA Bar (lg:hidden) */}
      <aside aria-label="Booking step action bar" className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#071525]/95 backdrop-blur-md border-t border-border p-3 px-4 flex items-center justify-between pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.12)] lg:hidden">
        <button
          type="button"
          onClick={() => setShowMobilePriceSheet(true)}
          className="flex flex-col text-left cursor-pointer min-touch-target -ml-1 pr-2"
        >
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
            <span>Payable</span>
            <ChevronUp className="h-3 w-3 text-accent" />
          </div>
          <span className="text-xl font-extrabold text-primary font-mono leading-tight">
            {formatCurrency(pricingBreakdown.totalPayableInr)}
          </span>
          <span className="text-[10px] text-accent font-semibold underline underline-offset-2">
            View detailed bill
          </span>
        </button>

        <div className="flex items-center gap-2">
          {currentStep === 0 && (
            <Button
              variant="accent"
              size="lg"
              onClick={() => setCurrentStep(1)}
              className="min-touch-target px-5 font-bold bg-[#FF6A00] hover:bg-accent-dark text-white rounded-2xl shadow-md gap-1.5 cursor-pointer text-sm"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          )}
          {currentStep === 1 && (
            <Button
              variant="accent"
              size="lg"
              onClick={() => setCurrentStep(2)}
              className="min-touch-target px-5 font-bold bg-[#FF6A00] hover:bg-accent-dark text-white rounded-2xl shadow-md gap-1.5 cursor-pointer text-sm"
            >
              Address <ArrowRight className="h-4 w-4" />
            </Button>
          )}
          {currentStep === 2 && (
            <Button
              variant="accent"
              size="lg"
              disabled={!serviceability.isServiceable}
              onClick={() => setCurrentStep(3)}
              className="min-touch-target px-5 font-bold bg-[#FF6A00] hover:bg-accent-dark text-white rounded-2xl shadow-md gap-1.5 cursor-pointer text-sm"
            >
              Time Slot <ArrowRight className="h-4 w-4" />
            </Button>
          )}
          {currentStep === 3 && (
            <Button
              variant="accent"
              size="lg"
              disabled={!selectedSlotId}
              onClick={() => setCurrentStep(4)}
              className="min-touch-target px-5 font-bold bg-[#FF6A00] hover:bg-accent-dark text-white rounded-2xl shadow-md gap-1.5 cursor-pointer text-sm"
            >
              Review <ArrowRight className="h-4 w-4" />
            </Button>
          )}
          {currentStep === 4 && (
            <Button
              variant="accent"
              size="lg"
              disabled={isSubmitting}
              onClick={isPaymentGatewayConfigured ? () => setCurrentStep(5) : handleConfirmBooking}
              className="min-touch-target px-5 font-bold bg-[#FF6A00] hover:bg-accent-dark text-white rounded-2xl shadow-md gap-1.5 cursor-pointer text-sm"
            >
              {isPaymentGatewayConfigured ? (
                <>Payment <ArrowRight className="h-4 w-4" /></>
              ) : (
                isSubmitting ? "Placing..." : "Confirm Booking"
              )}
            </Button>
          )}
          {isPaymentGatewayConfigured && currentStep === 5 && (
            <Button
              variant="accent"
              size="lg"
              disabled={isSubmitting}
              onClick={handleConfirmBooking}
              className="min-touch-target px-5 font-bold bg-[#FF6A00] hover:bg-accent-dark text-white rounded-2xl shadow-md gap-1.5 cursor-pointer text-sm"
            >
              {isSubmitting ? "Placing..." : "Confirm Booking"}
            </Button>
          )}
        </div>
      </aside>

      {/* Mobile Price Breakdown Bottom Sheet */}
      <AnimatePresence>
        {showMobilePriceSheet && (
          <div className="fixed inset-0 z-50 flex items-end justify-center lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobilePriceSheet(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 320 }}
              className="relative w-full max-w-lg bg-surface border-t border-border rounded-t-3xl shadow-2xl p-6 pb-safe space-y-4 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <h3 className="font-heading font-bold text-base text-primary">Itemized Price Breakdown</h3>
                <button
                  type="button"
                  onClick={() => setShowMobilePriceSheet(false)}
                  className="min-touch-target p-1.5 -mr-1.5 text-foreground-muted hover:text-primary"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-foreground-secondary">
                <div className="flex justify-between">
                  <span>Base Service Labour ({primaryService.serviceName})</span>
                  <span className="font-mono text-primary font-bold">{formatCurrency(pricingBreakdown.baseAmount)}</span>
                </div>

                {pricingBreakdown.materialsAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Materials & Parts (at actuals)</span>
                    <span className="font-mono text-primary font-bold">
                      {formatCurrency(pricingBreakdown.materialsAmount)}
                    </span>
                  </div>
                )}

                {Boolean(pricingBreakdown.nightFee && pricingBreakdown.nightFee > 0) && (
                  <div className="flex justify-between text-indigo-700 dark:text-indigo-400 font-semibold">
                    <span>Night Surcharge (Post 8 PM)</span>
                    <span className="font-mono">+{formatCurrency(pricingBreakdown.nightFee)}</span>
                  </div>
                )}

                {pricingBreakdown.discountMembership > 0 && (
                  <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-semibold">
                    <span>PLUS Membership (20% Off)</span>
                    <span className="font-mono">-₹{pricingBreakdown.discountMembership}</span>
                  </div>
                )}

                {pricingBreakdown.discountCoupon > 0 && (
                  <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-semibold">
                    <span>Coupon Discount ({pricingBreakdown.couponCode})</span>
                    <span className="font-mono">-₹{pricingBreakdown.discountCoupon}</span>
                  </div>
                )}

                {pricingBreakdown.safetyFee > 0 && (
                  <div className="flex justify-between">
                    <span>Safety & Equipment Fee</span>
                    <span className="font-mono text-primary font-bold">
                      {formatCurrency(pricingBreakdown.safetyFee)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>{activePricingConfig?.taxLabel || "Taxes & GST (18%)"}</span>
                  <span className="font-mono text-primary font-bold">{formatCurrency(pricingBreakdown.taxGst)}</span>
                </div>

                <div className="flex justify-between pt-3 border-t border-border text-base font-extrabold text-primary">
                  <span>Total Amount Payable</span>
                  <span className="font-mono text-xl text-[#FF6A00]">
                    {formatCurrency(pricingBreakdown.totalPayableInr)}
                  </span>
                </div>
              </div>

              <Button
                variant="accent"
                className="w-full min-touch-target font-bold bg-[#FF6A00] hover:bg-accent-dark text-white rounded-2xl"
                onClick={() => setShowMobilePriceSheet(false)}
              >
                Close & Continue
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Authoritative Kolkata-Wide Address Modal */}
      <AddressFormModal
        isOpen={isAddressModalOpen}
        onClose={() => {
          setIsAddressModalOpen(false);
          setEditingAddress(null);
        }}
        initialData={editingAddress}
        onSuccess={handleAddressSaved}
        defaultFullName={user?.fullName || ""}
        defaultPhone={user?.phone || ""}
      />
    </div>
  );
}
