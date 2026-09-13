import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import {
  Check,
  X,
  Shield,
  Clock,
  Star,
  ArrowRight,
  ArrowLeft,
  MapPin,
  CheckCircle2,
  Wrench,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  ChevronDown,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SERVICE_CATEGORIES, CATEGORY_SERVICES_MAP } from "@/constants/services";
import { ROUTES } from "@/constants/routes";
import { formatCurrency } from "@/lib/currency";
import { serviceabilityEngine } from "@/services/marketplace/serviceability.engine";
import { useCartStore } from "@/store/cart.store";

export default function ServiceDetail() {
  const navigate = useNavigate();
  const { category: categorySlug, service: serviceSlug } = useParams<{
    category: string;
    service: string;
  }>();

  const category = SERVICE_CATEGORIES.find(
    (c) => c.slug === categorySlug || c.id === categorySlug
  );

  const categoryKey = (category?.slug || categorySlug || "electrical") as string;
  const servicesList = CATEGORY_SERVICES_MAP[categoryKey] || CATEGORY_SERVICES_MAP["electrical"] || [];

  const service = servicesList.find(
    (s: any) => s.id === serviceSlug || s.slug === serviceSlug
  ) || servicesList[0];

  const { addItem } = useCartStore();

  // Variant State
  const variants = [
    { id: "v1", name: "Standard Single Unit", priceMultiplier: 1.0, duration: "30-45 mins" },
    { id: "v2", name: "Dual Unit Combo (Save 15%)", priceMultiplier: 1.7, duration: "60-80 mins" },
    { id: "v3", name: "Family Pack (3+ Units, Save 25%)", priceMultiplier: 2.25, duration: "90-120 mins" },
  ];
  const [selectedVariantId, setSelectedVariantId] = useState("v1");

  // Pincode check state
  const [pincodeInput, setPincodeInput] = useState("");
  const [pincodeResult, setPincodeResult] = useState<{ checked: boolean; serviceable?: boolean; locality?: string; message?: string }>({
    checked: false,
  });

  // FAQs open state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  if (!service) {
    return (
      <div className="container-app py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-primary">Service Not Found</h2>
        <p className="text-foreground-secondary">
          The requested service catalog item does not exist or has been moved.
        </p>
        <Button asChild variant="accent">
          <Link to={ROUTES.SERVICES}>Browse All Services</Link>
        </Button>
      </div>
    );
  }

  const basePrice = service.discountedPrice || service.basePrice || 199;
  const activeVariant = variants.find((v) => v.id === selectedVariantId) || variants[0];
  const effectivePrice = Math.round(basePrice * activeVariant.priceMultiplier);

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincodeInput.trim()) return;
    const res = serviceabilityEngine.checkPincode(pincodeInput.trim());
    setPincodeResult({
      checked: true,
      serviceable: res.isServiceable,
      locality: res.localityName,
      message: res.isServiceable
        ? `Available in ${res.localityName}, ${res.cityName}! Earliest slot: ${res.earliestSlot}`
        : res.reason,
    });
  };

  const handleBookNow = () => {
    addItem({
      ...service,
      basePrice: effectivePrice,
      discountedPrice: effectivePrice,
      variantName: activeVariant.name,
    });
    navigate(ROUTES.APP_BOOK);
  };

  const faqs = service.faqs || [
    {
      question: "Do I need to supply any materials or tools?",
      answer: "No. All Home-e-Fix professionals carry specialized diagnostic equipment and standard tools. Any spare parts or replacement materials are billed at actual retail MRP with zero hidden markups.",
    },
    {
      question: "What happens if the service diagnosis reveals additional issues?",
      answer: "The professional must submit a formal additional charge proposal in the application with exact part costs. Work will ONLY proceed after you tap 'Approve' on your screen.",
    },
    {
      question: "How does the 30-Day Service Warranty work?",
      answer: "Every completed job is automatically covered for 30 days. If the exact same issue re-occurs, raise a warranty claim from your dashboard for a 100% free technician revisit.",
    },
  ];

  return (
    <div className="py-8 md:py-14">
      <div className="container-app space-y-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-foreground-secondary">
          <Link to={ROUTES.SERVICES} className="hover:text-accent flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> All Services
          </Link>
          <span>/</span>
          <Link to={`/services/${category?.slug || categoryKey}`} className="hover:text-accent">
            {category?.name || "Services"}
          </Link>
          <span>/</span>
          <span className="text-primary font-semibold">{service.name}</span>
        </div>

        {/* Main Content & Sticky Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Columns */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Card */}
            <div className="rounded-3xl border border-border bg-surface p-6 md:p-8 space-y-6 shadow-sm">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-accent/10 text-accent font-bold text-xs uppercase tracking-wider">
                  {category?.name || "Home Service"}
                </span>
                <div className="flex items-center gap-1 text-amber-500 text-sm font-bold">
                  <Star className="h-4 w-4 fill-amber-500" />
                  <span>{service.rating || 4.9} ({service.reviewCount || 420}+ verified reviews)</span>
                </div>
                <div className="flex items-center gap-1 text-foreground-muted text-sm">
                  <Clock className="h-4 w-4" />
                  <span>{activeVariant.duration}</span>
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-extrabold text-primary">
                {service.name}
              </h1>

              <p className="text-foreground-secondary text-base leading-relaxed">
                {service.shortDescription ||
                  "Professional installation, precision repair, and thorough quality inspection performed by police-verified master technicians."}
              </p>

              {/* Service Variants Selector */}
              <div className="pt-4 border-t border-border space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-accent" /> Select Variant / Package
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {variants.map((v) => {
                    const price = Math.round(basePrice * v.priceMultiplier);
                    const isSelected = selectedVariantId === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariantId(v.id)}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "border-accent bg-accent/5 ring-2 ring-accent/20"
                            : "border-border bg-surface hover:border-slate-300"
                        }`}
                      >
                        <div className="text-xs font-bold text-primary">{v.name}</div>
                        <div className="text-sm font-extrabold text-[#FF6A00] mt-1">{formatCurrency(price)}</div>
                        <div className="text-[10px] text-foreground-muted mt-0.5">{v.duration}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* What is Included / Excluded */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-primary flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-success" /> What's Included
                  </h4>
                  <ul className="space-y-2 text-xs md:text-sm text-foreground-secondary">
                    <li className="flex items-start gap-2">
                      <span className="text-success font-bold">✓</span> Pre-service diagnostics & testing
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success font-bold">✓</span> Professional labor using certified tools
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success font-bold">✓</span> 30-Day Home-e-Fix Re-work Warranty
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-success font-bold">✓</span> Post-service clean-up & waste clearing
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-primary flex items-center gap-1.5">
                    <X className="h-4 w-4 text-error" /> What's Excluded
                  </h4>
                  <ul className="space-y-2 text-xs md:text-sm text-foreground-secondary">
                    <li className="flex items-start gap-2">
                      <span className="text-error font-bold">✕</span> Replacement spare parts (billed at actuals)
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-error font-bold">✕</span> Major masonry or civil wall demolition
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-error font-bold">✕</span> Concealed structural rewiring
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Service Process Checklist */}
            <div className="rounded-3xl border border-border bg-surface p-6 md:p-8 space-y-6">
              <h3 className="font-heading text-lg font-bold text-primary flex items-center gap-2">
                <Wrench className="h-5 w-5 text-accent" /> Standard Operating Process
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-2">
                  <span className="h-6 w-6 rounded-full bg-primary text-white font-bold flex items-center justify-center text-[11px]">1</span>
                  <p className="font-bold text-primary">Arrival & OTP</p>
                  <p className="text-foreground-secondary">Technician arrives in uniform, presents ID, verifies start OTP.</p>
                </div>
                <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-2">
                  <span className="h-6 w-6 rounded-full bg-primary text-white font-bold flex items-center justify-center text-[11px]">2</span>
                  <p className="font-bold text-primary">Diagnosis</p>
                  <p className="text-foreground-secondary">Inspection using diagnostic equipment to pinpoint exact fault.</p>
                </div>
                <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-2">
                  <span className="h-6 w-6 rounded-full bg-primary text-white font-bold flex items-center justify-center text-[11px]">3</span>
                  <p className="font-bold text-primary">Pre-Approval</p>
                  <p className="text-foreground-secondary">Any extra spares require digital customer confirmation first.</p>
                </div>
                <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-2">
                  <span className="h-6 w-6 rounded-full bg-primary text-white font-bold flex items-center justify-center text-[11px]">4</span>
                  <p className="font-bold text-primary">Quality Test</p>
                  <p className="text-foreground-secondary">Full operational test, cleanup, and 30-day warranty activation.</p>
                </div>
              </div>
            </div>

            {/* FAQs Accordion */}
            <div className="rounded-3xl border border-border bg-surface p-6 md:p-8 space-y-4">
              <h3 className="font-heading text-lg font-bold text-primary flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-accent" /> Frequently Asked Questions
              </h3>
              <div className="space-y-3">
                {faqs.map((faq: any, idx: number) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div key={idx} className="border border-border rounded-2xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-primary hover:bg-muted/20"
                      >
                        <span>{faq.question}</span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                      </button>
                      {isOpen && (
                        <div className="p-4 pt-0 text-xs text-foreground-secondary leading-relaxed">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Booking & Serviceability Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-3xl border-2 border-border bg-surface p-6 shadow-lg space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
                  Package Rate
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold text-primary font-mono">
                    {formatCurrency(effectivePrice)}
                  </span>
                  <span className="text-xs text-foreground-secondary">
                    (Includes labor & warranty)
                  </span>
                </div>
              </div>

              {/* Serviceability Check */}
              <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2">
                <label className="text-[11px] font-bold text-primary flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-accent" /> Check Service Availability
                </label>
                <form onSubmit={handleCheckPincode} className="flex gap-2">
                  <Input
                    placeholder="Enter 6-digit Pincode (e.g. 700064)"
                    value={pincodeInput}
                    onChange={(e) => setPincodeInput(e.target.value)}
                    maxLength={6}
                    className="text-xs h-9"
                  />
                  <Button type="submit" size="sm" variant="outline" className="text-xs shrink-0">
                    Check
                  </Button>
                </form>
                {pincodeResult.checked && (
                  <div
                    className={`text-[11px] p-2 rounded-xl mt-2 flex items-start gap-1.5 ${
                      pincodeResult.serviceable
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-rose-50 text-rose-800 border border-rose-200"
                    }`}
                  >
                    {pincodeResult.serviceable ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-3.5 w-3.5 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <span>{pincodeResult.message}</span>
                  </div>
                )}
              </div>

              {/* Specifications checklist */}
              <div className="space-y-2 text-xs text-foreground-secondary border-t border-b border-border py-4">
                <div className="flex justify-between">
                  <span>Standard Visit:</span>
                  <span className="font-bold text-primary">Included</span>
                </div>
                <div className="flex justify-between">
                  <span>Spares & Material:</span>
                  <span className="font-bold text-primary">Actual MRP</span>
                </div>
                <div className="flex justify-between">
                  <span>Warranty:</span>
                  <span className="font-bold text-success">30 Days Guaranteed</span>
                </div>
                <div className="flex justify-between">
                  <span>Emergency Dispatch:</span>
                  <span className="font-bold text-accent">Available (2-Hr)</span>
                </div>
              </div>

              <Button
                variant="accent"
                size="lg"
                onClick={handleBookNow}
                className="w-full shadow-glow gap-2 cursor-pointer"
              >
                Book This Service Now <ArrowRight className="h-4 w-4" />
              </Button>

              <p className="text-[11px] text-center text-foreground-muted">
                🔒 Safe payment on service completion. Free cancellation up to 2 hours before your slot.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
