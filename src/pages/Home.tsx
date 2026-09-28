import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Clock,
  Sparkles,
  ChevronDown,
  Zap,
  Check,
  MapPin,
  FileText,
  Wrench,
  Calendar,
  AlertTriangle,
  Star,
  Crown,
  Droplets,
  Wind,
  Hammer,
  Paintbrush,
  Camera,
  Tv,
  Crosshair,
  Lock,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { ServiceCard } from "@/components/ui/service-card";
import { useCartStore } from "@/store/cart.store";
import { useLocationStore, formatLocationLabel } from "@/store/location.store";
import { ROUTES } from "@/constants/routes";
import {
  SERVICE_CATEGORIES,
  POPULAR_SERVICES,
  BLOG_ARTICLES,
  OPERATIONAL_CITIES,
  MEMBERSHIP_PLANS,
} from "@/constants/services";
import { dbRepository } from "@/services/db/repository";
import { HomeEFixCharacter } from "@/components/character/HomeEFixCharacter";

/* ─── Motion Variants (Restrained 150-300ms) ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      delay: i * 0.05,
      ease: "easeOut" as const,
    },
  }),
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.04,
    },
  },
};

/* ─── Category Icon Mapping (Semantically Accurate Lucide Icons) ─── */
const CATEGORY_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  electrical: Zap,
  plumbing: Droplets,
  ac: Wind,
  cleaning: Sparkles,
  carpentry: Hammer,
  painting: Paintbrush,
  security: Camera,
  appliances: Tv,
};

/* ─── 8 Authentic Homepage FAQs ─── */
const AUTHENTIC_HOMEPAGE_FAQS = [
  {
    question: "How do I book a service?",
    answer:
      "Select your required service, choose your preferred location and time slot, and confirm your booking. A verified technician is scheduled and arrives with necessary tools at your selected time.",
  },
  {
    question: "How is the price calculated?",
    answer:
      "Every service features upfront standard labour rates from our verified catalog. If replacement spare parts or raw materials are required on-site, the technician provides transparent rates before installation.",
  },
  {
    question: "Can I choose my service location?",
    answer:
      "Yes. You can select your locality or enter your 6-digit postal code. Home-e-Fix verifies serviceability in real-time across our active Kolkata operational hubs.",
  },
  {
    question: "Can I cancel a booking?",
    answer:
      "Yes. Bookings can be cancelled free of charge from your customer dashboard at any time before the technician is dispatched.",
  },
  {
    question: "How are professionals approved?",
    answer:
      "Every professional must submit government ID (Aadhaar & PAN), pass police verification, and complete practical trade skill vetting before receiving admin approval.",
  },
  {
    question: "What happens if my location is outside the service area?",
    answer:
      'If your postal code is outside active hubs, the system indicates "Home-e-Fix is not currently available at this location." You can request to be notified when coverage expands.',
  },
  {
    question: "Are materials included in the service price?",
    answer:
      "Standard pricing covers diagnostic and skilled labour. Any spare parts, pipes, or modular switches needed can either be supplied by you or procured by the technician at MRP with a verified digital bill.",
  },
  {
    question: "How can I become a professional?",
    answer:
      "Skilled technicians can apply via the 'Become a Professional' link. Sign in with Google, complete mobile verification, specify your trade skills and service areas, and await admin approval.",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { items, addItem, removeItem } = useCartStore();
  const {
    locality,
    city,
    setLocation,
    setManualLocation,
    detectCurrentLocation,
    isDetecting,
  } = useLocationStore();

  const locationLabel = formatLocationLabel({ locality, city });

  // Location Search State
  const [localityQuery, setLocalityQuery] = useState("");
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [customPincode, setCustomPincode] = useState("");
  const [selectedUpcomingCity, setSelectedUpcomingCity] = useState<string | null>(null);
  const [notifyInput, setNotifyInput] = useState("");
  const [notifySuccess, setNotifySuccess] = useState<string | null>(null);

  // FAQ State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Interactive Booking Preview State (Hero Right Panel)
  const [previewServiceSlug, setPreviewServiceSlug] = useState("split-ac-foam-servicing");
  const [previewSlot, setPreviewSlot] = useState("Morning (09:00 AM - 12:00 PM)");

  // Reviews State
  const [realReviews, setRealReviews] = useState<any[]>([]);

  // Mobile Sticky CTA
  const [showMobileSticky, setShowMobileSticky] = useState(false);

  useEffect(() => {
    setRealReviews(dbRepository.getReviews());
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowMobileSticky(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const activeCategories = useMemo(() => {
    return SERVICE_CATEGORIES.slice(0, 8);
  }, []);

  // Display top 4 diverse popular services for desktop grid
  const displayedPopularServices = useMemo(() => {
    return POPULAR_SERVICES.slice(0, 4);
  }, []);

  const activePreviewService = useMemo(() => {
    return (
      POPULAR_SERVICES.find((s) => s.slug === previewServiceSlug) ||
      POPULAR_SERVICES[0]
    );
  }, [previewServiceSlug]);

  const handleToggleAddService = (service: any) => {
    const isAlreadyAdded = items.some((i) => i.id === service.id);
    if (isAlreadyAdded) {
      removeItem(service.id);
    } else {
      addItem(service);
    }
  };

  const handleDirectBook = (service: any) => {
    navigate(`${ROUTES.APP_BOOK}?service=${encodeURIComponent(service.slug)}`);
  };

  const handleApplyLocation = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (localityQuery.trim()) {
      setManualLocation(localityQuery.trim());
      setLocalityQuery("");
    }
  };

  return (
    <div className="overflow-hidden bg-background text-foreground font-sans selection:bg-[#FF6A00]/20 selection:text-[#FF6A00]">
      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION (Desktop min-height ~600px, Restrained & Bold)
         ───────────────────────────────────────────────────────────── */}
      <section className="relative min-h-145 lg:min-h-155 py-10 sm:py-14 lg:py-20 flex items-center bg-primary text-white overflow-hidden">
        {/* Subtle Ambient Brand Lighting */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(6,182,212,0.12),transparent)] pointer-events-none" />
        <div className="absolute top-1/4 -left-32 w-80 h-80 rounded-full bg-[#FF6A00]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-[#06B6D4]/10 blur-3xl pointer-events-none" />

        <div className="container-app relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Commercial Value Proposition */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="lg:col-span-7 space-y-4 sm:space-y-6 text-left"
            >
              {/* Eyebrow */}
              <motion.div
                variants={fadeUp}
                custom={0}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-[11px] sm:text-xs font-bold tracking-wider uppercase text-cyan-300"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#FF6A00]" />
                <span>HOME SERVICES • ON-DEMAND • TRUSTED</span>
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                variants={fadeUp}
                custom={1}
                className="font-heading text-3xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight leading-[1.15] text-white"
              >
                Everything your home needs.
                <br />
                <span className="text-[#FF6A00] drop-shadow-sm">One simple fix.</span>
              </motion.h1>

              {/* Supporting Text */}
              <motion.p
                variants={fadeUp}
                custom={2}
                className="text-sm sm:text-base lg:text-lg text-slate-200 font-normal leading-relaxed max-w-xl"
              >
                Book reliable home repair and maintenance services from one place.
              </motion.p>

              {/* Primary & Secondary CTA Buttons */}
              <motion.div
                variants={fadeUp}
                custom={3}
                className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4"
              >
                <Button
                  size="lg"
                  className="min-h-12 bg-[#FF6A00] hover:bg-[#E55F00] text-white font-bold text-sm sm:text-base px-7 py-3 rounded-xl shadow-lg shadow-orange-500/25 active:scale-98 transition-all cursor-pointer"
                  onClick={() => navigate(ROUTES.APP_BOOK)}
                >
                  <span>Book a Service</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="min-h-12 border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold text-sm sm:text-base px-6 py-3 rounded-xl backdrop-blur-md cursor-pointer transition-all"
                  onClick={() => navigate(ROUTES.SERVICES)}
                >
                  <span>Explore Services</span>
                </Button>
              </motion.div>

              {/* Verified Trust Row */}
              <motion.div
                variants={fadeUp}
                custom={4}
                className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-white/10 text-xs sm:text-sm text-slate-300"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#FF6A00] shrink-0" />
                  <span className="font-medium">Transparent pricing</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="font-medium">Easy booking</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#FF6A00] shrink-0" />
                  <span className="font-medium">Local service coverage</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column: Realistic Service Discovery & Booking Preview */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="lg:col-span-5"
            >
              <Card className="p-6 sm:p-7 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl text-white space-y-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-white">Need help at home?</h3>
                    <p className="text-xs text-slate-300">Choose a service and confirm your slot</p>
                  </div>
                  <Badge variant="outline" className="border-white/30 text-[11px] text-cyan-300 bg-white/5 font-semibold">
                    {locality || city || "Select location"}
                  </Badge>
                </div>

                {/* Popular Quick Category Shortcuts */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 block">Popular Categories</label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: "Electrical", slug: "switch-socket-installation" },
                      { label: "Plumbing", slug: "bathroom-leakage-tap-repair" },
                      { label: "AC Repair", slug: "split-ac-foam-servicing" },
                    ].map((pill) => (
                      <button
                        key={pill.label}
                        type="button"
                        onClick={() => setPreviewServiceSlug(pill.slug)}
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer border",
                          previewServiceSlug === pill.slug
                            ? "bg-[#FF6A00] border-[#FF6A00] text-white"
                            : "bg-white/5 border-white/15 text-slate-300 hover:bg-white/10"
                        )}
                      >
                        {pill.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Database-Driven Service Selection */}
                <div className="space-y-2">
                  <label htmlFor="hero-service-picker" className="text-xs font-semibold text-slate-300 block">
                    Select Service
                  </label>
                  <select
                    id="hero-service-picker"
                    value={previewServiceSlug}
                    onChange={(e) => setPreviewServiceSlug(e.target.value)}
                    className="w-full h-11 px-3 bg-slate-900/90 border border-white/20 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-[#FF6A00] cursor-pointer"
                  >
                    {POPULAR_SERVICES.map((s) => (
                      <option key={s.slug} value={s.slug} className="bg-primary text-white">
                        {s.name} — {s.pricingLabel || formatCurrency(s.discountedPrice || s.basePrice)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Convenient Slot Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 block">Preferred Slot</label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      "Morning (09:00 - 12:00)",
                      "Afternoon (12:00 - 15:00)",
                      "Late Afternoon (15:00 - 18:00)",
                      "Evening (18:00 - 21:00)",
                    ].map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setPreviewSlot(slot)}
                        className={cn(
                          "p-2.5 rounded-xl text-left border text-[11px] font-medium transition-all cursor-pointer truncate",
                          previewSlot === slot
                            ? "bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold"
                            : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                        )}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dynamic Price Breakdown Preview */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Upfront Estimate</span>
                    <span className="text-xl font-bold text-white">
                      {activePreviewService.pricingLabel ||
                        formatCurrency(activePreviewService.discountedPrice || activePreviewService.basePrice)}
                    </span>
                  </div>
                  <span className="text-cyan-300 text-[11px] font-semibold flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-cyan-400" />
                    Standard Upfront Rates
                  </span>
                </div>

                {/* Direct Booking CTA */}
                <Button
                  type="button"
                  className="w-full h-12 rounded-xl bg-[#FF6A00] hover:bg-[#E55F00] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all cursor-pointer active:scale-98"
                  onClick={() => handleDirectBook(activePreviewService)}
                >
                  <span>Book a Service</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. LOCATION SEARCH (Real Location Integration)
         ───────────────────────────────────────────────────────────── */}
      <section className="relative -mt-6 z-20 container-app">
        <div className="border border-border/80 rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 bg-white dark:bg-slate-900">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF6A00]">
                Service Coverage Check
              </span>
              <h2 className="font-heading text-base sm:text-xl font-bold text-primary dark:text-white">
                Where do you need a service?
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {locality || city
                  ? `Service available near ${formatLocationLabel({ locality, city })}`
                  : "Enter your area or postal code to verify service availability."}
              </p>
            </div>

            <form
              onSubmit={handleApplyLocation}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3"
            >
              {/* Location Selector Pill */}
              <button
                type="button"
                onClick={() => setShowLocationModal(true)}
                className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold cursor-pointer border border-slate-200 dark:border-slate-700 hover:border-orange-400 transition-colors"
              >
                <div className="flex items-center gap-1.5 truncate max-w-44">
                  <MapPin className="w-4 h-4 text-[#FF6A00] shrink-0" />
                  <span className="truncate">{locationLabel}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              {/* Locality / Pincode Input */}
              <div className="relative flex-1 sm:w-60">
                <Input
                  type="text"
                  value={localityQuery}
                  onChange={(e) => setLocalityQuery(e.target.value)}
                  placeholder="Enter locality or pincode..."
                  className="h-10 text-xs rounded-xl"
                />
              </div>

              {/* GPS Location Auto-detect */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => detectCurrentLocation()}
                disabled={isDetecting}
                className="h-10 text-xs font-semibold rounded-xl shrink-0 cursor-pointer"
              >
                <Crosshair className={cn("w-3.5 h-3.5 mr-1.5 text-cyan-600", isDetecting && "animate-spin")} />
                <span>{isDetecting ? "Detecting..." : "Use Current Location"}</span>
              </Button>

              {/* Apply Button */}
              <Button
                type="submit"
                size="sm"
                className="h-10 px-5 bg-primary hover:bg-[#143560] text-white text-xs font-bold rounded-xl shrink-0 cursor-pointer"
              >
                Confirm
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. POPULAR CATEGORIES (Horizontal Scroll Mobile, Clean Desktop)
         ───────────────────────────────────────────────────────────── */}
      <section className="container-app py-12 sm:py-16 lg:py-20">
        <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/10 text-[#FF6A00] text-xs font-bold uppercase tracking-wider mb-1">
              <span>Categories</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-primary dark:text-white">
              Popular Categories
            </h2>
          </div>
          <Link
            to={ROUTES.SERVICES}
            className="text-xs sm:text-sm font-bold text-[#FF6A00] hover:underline flex items-center gap-1 shrink-0"
          >
            See All ({SERVICE_CATEGORIES.length}) &rarr;
          </Link>
        </div>

        {/* Categories: Horizontal scroll on mobile, responsive grid on desktop */}
        <div className="flex overflow-x-auto pb-4 gap-3 sm:gap-4 md:grid md:grid-cols-4 lg:grid-cols-8 md:pb-0 scrollbar-hide snap-x">
          {activeCategories.map((category) => {
            const Icon = CATEGORY_ICON_MAP[category.slug] || Wrench;
            return (
              <Link
                key={category.id}
                to={`${ROUTES.SERVICES}/${category.slug}`}
                className="group flex flex-col items-center justify-between text-center p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-[#FF6A00] transition-all duration-200 hover:shadow-md bg-white dark:bg-slate-900/60 min-w-35 sm:min-w-37.5 md:min-w-0 shrink-0 snap-start"
              >
                <div className="flex flex-col items-center w-full">
                  <div
                    className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-105 shadow-xs mb-2.5"
                    style={{ backgroundColor: `${category.color}15`, color: category.color }}
                  >
                    <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                  </div>

                  <h3 className="font-heading text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#FF6A00] transition-colors leading-tight line-clamp-1">
                    {category.name}
                  </h3>
                </div>

                <span className="text-xs text-[#FF6A00] font-semibold mt-2">
                  ₹{category.startingPrice}+
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. POPULAR SERVICES (4 Cards Desktop, 2 Tablet, 1 Mobile)
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-slate-50 dark:bg-slate-900/40 py-12 sm:py-16 lg:py-20 border-y border-slate-200/60 dark:border-slate-800">
        <div className="container-app">
          <div className="flex items-end justify-between gap-4 mb-6 sm:mb-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/10 text-[#FF6A00] text-xs font-bold uppercase tracking-wider mb-1">
                <span>Top Rated</span>
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-primary dark:text-white">
                Popular Services
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                Quick fixes for the things your home needs most.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="text-xs font-semibold shrink-0"
              asChild
            >
              <Link to={ROUTES.SERVICES}>
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </Button>
          </div>

          {/* 4 Cards Desktop, 2 Cards Tablet, 1 Card Mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
            {displayedPopularServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                isAdded={items.some((i) => i.id === service.id)}
                onAdd={handleToggleAddService}
                onRemove={handleToggleAddService}
                onBookNow={handleDirectBook}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. HOW HOME-E-FIX WORKS (4 Sequential Clean Steps)
         ───────────────────────────────────────────────────────────── */}
      <section className="container-app py-14 sm:py-20">
        <div className="text-center space-y-2 mb-12">
          <Badge variant="accent" className="px-3 py-1 uppercase font-bold text-xs">
            Simple Booking
          </Badge>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-primary dark:text-white">
            How Home-e-Fix Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Book professional home service in four straightforward steps.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: "01",
              title: "Choose a service",
              desc: "Browse transparently priced home repair and maintenance services.",
            },
            {
              step: "02",
              title: "Tell us what you need",
              desc: "Specify your service requirement, scope of repair, and any parts needed.",
            },
            {
              step: "03",
              title: "Select location & time",
              desc: "Choose your address and a convenient arrival time slot.",
            },
            {
              step: "04",
              title: "Confirm your booking",
              desc: "A verified professional is assigned, and you pay securely after completion.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="text-center p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-[#FF6A00] font-heading font-extrabold text-sm shadow-xs">
                {item.step}
              </div>
              <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                {item.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. EMERGENCY / URGENT HOME HELP
         ───────────────────────────────────────────────────────────── */}
      <section className="container-app py-10 sm:py-14">
        <div className="rounded-3xl bg-primary border border-orange-500/30 text-white p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#FF6A00]/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider">
              <AlertTriangle className="w-3.5 h-3.5 text-[#FF6A00]" />
              <span>Urgent Assistance</span>
            </div>

            <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-white leading-tight">
              Need urgent help at home?
            </h2>

            <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
              Check available services and time slots near you.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                size="lg"
                className="bg-[#FF6A00] hover:bg-[#E55F00] text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-orange-500/25 cursor-pointer"
                onClick={() => navigate(`${ROUTES.APP_BOOK}?emergency=true`)}
              >
                Find a Service
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold text-sm px-6 py-3 rounded-xl cursor-pointer"
                onClick={() => navigate(ROUTES.SERVICES)}
              >
                Explore Services
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. WHY HOME-E-FIX (Concrete Product Benefits Only)
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-slate-50 dark:bg-slate-900/40 py-14 sm:py-20 border-y border-slate-200/60 dark:border-slate-800">
        <div className="container-app">
          <div className="text-center space-y-2 mb-12">
            <Badge variant="accent" className="px-3 py-1 uppercase font-bold text-xs">
              Why Home-e-Fix
            </Badge>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-primary dark:text-white">
              Carefully Built for Homeowners
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Reliable, transparent home maintenance without guesswork.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {[
              {
                title: "Transparent Pricing",
                desc: "See the service price before booking.",
                icon: FileText,
              },
              {
                title: "Easy Booking",
                desc: "Choose a service, location and convenient slot.",
                icon: Calendar,
              },
              {
                title: "Local Service Coverage",
                desc: "Availability depends on your selected service area.",
                icon: MapPin,
              },
              {
                title: "Service Tracking",
                desc: "Track your booking status from your account.",
                icon: Clock,
              },
              {
                title: "Secure Platform",
                desc: "Your account and booking information are protected.",
                icon: Lock,
              },
            ].map((benefit) => {
              const Icon = benefit.icon;
              return (
                <Card
                  key={benefit.title}
                  className="p-5 bg-white dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 rounded-2xl text-left space-y-2.5 shadow-xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-[#FF6A00] flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-heading text-sm font-bold text-slate-900 dark:text-white">
                    {benefit.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {benefit.desc}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          8. HOME-E-FIX PLUS (Clearly Separated Promotional Section)
         ───────────────────────────────────────────────────────────── */}
      <section className="container-app py-14 sm:py-20">
        <div className="max-w-4xl lg:max-w-5xl mx-auto rounded-3xl bg-primary border border-orange-500/30 text-white p-8 sm:p-12 relative overflow-hidden shadow-2xl">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#FF6A00]/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-orange-400 text-xs font-bold uppercase tracking-wider">
                <Crown className="w-3.5 h-3.5 text-[#FF6A00]" />
                <span>Home-e-Fix PLUS</span>
              </div>

              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
                Save more on eligible services.
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs sm:text-sm text-slate-200">
                {MEMBERSHIP_PLANS.monthly.perks.map((perk) => (
                  <div key={perk} className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#FF6A00] shrink-0" />
                    <span>{perk}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-4 text-center md:text-right space-y-4">
              <div className="p-5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md inline-block text-center w-full max-w-60 shadow-lg">
                <span className="text-xs text-slate-300 block uppercase tracking-wider font-semibold">Starting at</span>
                <span className="font-heading text-3xl sm:text-4xl font-extrabold text-white block my-1">
                  ₹{MEMBERSHIP_PLANS.monthly.price}<span className="text-xs font-normal text-slate-300">/mo</span>
                </span>
                <span className="text-xs text-orange-300 block">or ₹{MEMBERSHIP_PLANS.annual.price} billed annually</span>
              </div>

              <div>
                <Button
                  size="lg"
                  className="w-full min-h-12 bg-[#FF6A00] hover:bg-[#E55F00] text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 cursor-pointer"
                  asChild
                >
                  <Link to={ROUTES.MEMBERSHIP}>Explore PLUS</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          9. CUSTOMER TESTIMONIALS (Truthful & Authentic)
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-slate-50 dark:bg-slate-900/40 py-14 sm:py-20 border-y border-slate-200/60 dark:border-slate-800">
        <div className="container-app">
          <div className="text-center space-y-2 mb-10">
            <Badge variant="accent" className="px-3 py-1 uppercase font-bold text-xs">
              Homeowner Feedback
            </Badge>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-primary dark:text-white">
              Customer Feedback
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Verified feedback from homeowners who completed services with Home-e-Fix.
            </p>
          </div>

          {realReviews.length === 1 ? (
            /* Featured Single Review: Centered and Balanced */
            <div className="max-w-xl mx-auto">
              <Card className="p-6 sm:p-8 bg-white dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 rounded-3xl space-y-4 shadow-sm text-center">
                <div className="flex items-center justify-center gap-1 text-amber-500">
                  {Array.from({ length: realReviews[0].rating || 5 }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 italic leading-relaxed font-medium">
                  &ldquo;{realReviews[0].comment}&rdquo;
                </p>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-3 text-xs sm:text-sm">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {realReviews[0].userName || "Verified Customer"}
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <Badge variant="success" className="text-[11px] font-semibold">
                    Verified Service
                  </Badge>
                </div>
              </Card>
            </div>
          ) : realReviews.length > 1 ? (
            <div
              className={cn(
                "grid gap-6",
                realReviews.length === 2
                  ? "grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto"
                  : "grid-cols-1 md:grid-cols-3"
              )}
            >
              {realReviews.map((r, idx) => (
                <Card
                  key={r.id || idx}
                  className="p-6 bg-white dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-3 shadow-xs"
                >
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: r.rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
                    &ldquo;{r.comment}&rdquo;
                  </p>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {r.userName || "Verified Customer"}
                    </span>
                    <Badge variant="success" className="text-[10px]">Verified Service</Badge>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="max-w-2xl mx-auto p-8 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-center space-y-3">
              <HomeEFixCharacter state="relaxing" size={64} className="mx-auto" />
              <h3 className="font-heading text-base sm:text-lg font-bold text-primary dark:text-white">
                Home-e-Fix is building its first community of homeowners.
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                Book a service today, experience professional service with digital invoices, and leave your verified review.
              </p>
              <div className="pt-2">
                <Button size="sm" className="bg-[#FF6A00] hover:bg-[#E55F00] text-white font-bold" asChild>
                  <Link to={ROUTES.APP_BOOK}>Book a Service</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          10. HOME MAINTENANCE TIPS (3 Useful Articles)
         ───────────────────────────────────────────────────────────── */}
      <section className="container-app py-14 sm:py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <Badge variant="accent" className="mb-2 px-3 py-1 uppercase font-bold text-xs">
              Home Guides
            </Badge>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-primary dark:text-white">
              Home Maintenance Tips
            </h2>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to={ROUTES.BLOG}>All Articles &rarr;</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {BLOG_ARTICLES.slice(0, 3).map((article) => (
            <Card
              key={article.id}
              className="overflow-hidden flex flex-col h-full rounded-2xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs hover:border-[#FF6A00] transition-colors"
            >
              <div className="aspect-16/10 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={article.image}
                  alt={article.title}
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  loading="lazy"
                />
              </div>
              <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-bold text-[#FF6A00]">{article.category}</span>
                    <span>{article.readTime}</span>
                  </div>
                  <h3 className="font-heading text-sm sm:text-base font-bold text-slate-900 dark:text-white line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {article.snippet}
                  </p>
                </div>

                <div className="pt-2 text-xs font-bold text-[#FF6A00] flex items-center gap-1">
                  <Link to={ROUTES.BLOG} className="hover:underline flex items-center gap-1">
                    Read article <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          11. FREQUENTLY ASKED QUESTIONS (Comfortable Typography & Spacing)
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-slate-50 dark:bg-slate-900/40 py-14 sm:py-20 border-t border-slate-200/60 dark:border-slate-800">
        <div className="container-app max-w-3xl mx-auto">
          <div className="text-center space-y-2 mb-10">
            <Badge variant="accent" className="px-3 py-1 uppercase font-bold text-xs">
              Clear Policies
            </Badge>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-primary dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Clear answers about booking, pricing, coverage, and technicians.
            </p>
          </div>

          <div className="space-y-3">
            {AUTHENTIC_HOMEPAGE_FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;

              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden shadow-2xs"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between p-5 sm:p-5.5 text-left font-heading text-sm sm:text-base font-bold text-primary dark:text-white hover:text-[#FF6A00] transition-colors cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={cn(
                        "h-4.5 w-4.5 text-slate-400 transition-transform duration-200 shrink-0 ml-4",
                        isOpen && "rotate-180 text-[#FF6A00]"
                      )}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-5 sm:px-5.5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          12. FINAL CTA SECTION (Deep Navy & Orange)
         ───────────────────────────────────────────────────────────── */}
      <section className="container-app py-14 sm:py-20">
        <div className="rounded-3xl bg-primary text-white p-8 sm:p-14 text-center space-y-6 relative overflow-hidden shadow-2xl border border-white/10">
          <div className="mx-auto max-w-xl space-y-2.5">
            <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-white">
              Your home deserves better care.
            </h2>
            <p className="text-xs sm:text-base text-slate-200">
              Book the service you need without the hassle.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2">
            <Button
              size="lg"
              className="min-h-12 min-w-44 bg-[#FF6A00] hover:bg-[#E55F00] text-white font-bold text-sm sm:text-base px-8 py-3.5 rounded-xl shadow-lg shadow-orange-500/25 cursor-pointer"
              asChild
            >
              <Link to={ROUTES.APP_BOOK}>Book a Service</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="min-h-12 min-w-44 border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold text-sm sm:text-base px-6 py-3.5 rounded-xl cursor-pointer"
              asChild
            >
              <Link to={ROUTES.BECOME_A_PROFESSIONAL}>Become a Professional</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          13. MOBILE STICKY BOOKING ACTION BAR
         ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showMobileSticky && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed bottom-15 inset-x-0 z-40 p-3 bg-white/95 dark:bg-[#07172E]/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-2xl"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6A00] block">
                  Home-e-Fix
                </span>
                <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                  Transparent Upfront Rates
                </span>
              </div>
              <Button
                size="sm"
                className="bg-[#FF6A00] hover:bg-[#E55F00] text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md cursor-pointer"
                onClick={() => navigate(ROUTES.APP_BOOK)}
              >
                Book a Service
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────
          14. LOCATION SELECTOR MODAL
         ───────────────────────────────────────────────────────────── */}
      <Dialog open={showLocationModal} onClose={() => setShowLocationModal(false)} size="md">
        <DialogHeader onClose={() => setShowLocationModal(false)}>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-[#FF6A00]" />
            <DialogTitle>Select Your Service Location</DialogTitle>
          </div>
        </DialogHeader>
        <DialogContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
              Operational Hubs in Kolkata
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {OPERATIONAL_CITIES.activeHubs.map((hub) => (
                <button
                  key={hub.id}
                  type="button"
                  onClick={() => {
                    setLocation(hub.name, hub.pincode);
                    setShowLocationModal(false);
                    setSelectedUpcomingCity(null);
                  }}
                  className={cn(
                    "p-2.5 rounded-xl border text-xs font-medium text-left transition-all cursor-pointer flex items-center gap-1.5",
                    locality === hub.name
                      ? "border-[#FF6A00] bg-orange-500/10 text-[#FF6A00] font-bold"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-orange-300"
                  )}
                >
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-[#FF6A00]" />
                  <span className="truncate">{hub.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
              Expanding Soon
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {OPERATIONAL_CITIES.upcomingCities.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setSelectedUpcomingCity(c.name);
                    setNotifySuccess(null);
                  }}
                  className={cn(
                    "p-2.5 rounded-xl border text-xs font-medium text-left transition-all cursor-pointer flex flex-col justify-between",
                    selectedUpcomingCity === c.name
                      ? "border-[#FF6A00] bg-orange-500/10 text-[#FF6A00] font-bold"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-500"
                  )}
                >
                  <span className="font-semibold text-slate-900 dark:text-white">{c.name}</span>
                  <span className="text-[10px] text-[#FF6A00] mt-0.5">{c.status}</span>
                </button>
              ))}
            </div>

            {selectedUpcomingCity && (
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-orange-500/30 space-y-2 mt-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Get notified when Home-e-Fix launches in {selectedUpcomingCity}!
                </span>
                {notifySuccess ? (
                  <div className="text-xs font-semibold text-emerald-600 bg-emerald-500/10 p-2 rounded-lg">
                    {notifySuccess}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter phone or email..."
                      value={notifyInput}
                      onChange={(e) => setNotifyInput(e.target.value)}
                      className="text-xs h-9 rounded-xl"
                    />
                    <Button
                      size="sm"
                      className="bg-[#FF6A00] hover:bg-[#E55F00] text-white text-xs font-bold rounded-xl shrink-0"
                      onClick={() => {
                        if (notifyInput.trim()) {
                          setNotifySuccess(`🎉 You're on the list for ${selectedUpcomingCity}!`);
                          setNotifyInput("");
                        }
                      }}
                    >
                      Notify Me
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <label className="text-xs font-semibold text-slate-900 dark:text-white block">
              Enter Custom Area or Pincode
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. 700091 or Salt Lake Sector V"
                value={customPincode}
                onChange={(e) => setCustomPincode(e.target.value)}
                className="text-xs h-9 rounded-xl"
              />
              <Button
                size="sm"
                className="bg-primary hover:bg-[#143560] text-white text-xs font-bold rounded-xl shrink-0"
                onClick={() => {
                  if (customPincode.trim()) {
                    setLocation(customPincode.trim(), customPincode.trim());
                    setCustomPincode("");
                    setShowLocationModal(false);
                  }
                }}
              >
                Apply
              </Button>
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setShowLocationModal(false)}>
            Close
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
