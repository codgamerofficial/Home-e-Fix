import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Shield,
  Clock,
  CheckCircle2,
  Phone,
  Sparkles,
  ChevronDown,
  Zap,
  Check,
  Search,
  MapPin,
  FileText,
  CreditCard,
  Headphones,
  Wrench,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  Star,
  Award,
  Crown,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { ServiceCard } from "@/components/ui/service-card";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import { ROUTES } from "@/constants/routes";
import {
  SERVICE_CATEGORIES,
  POPULAR_SERVICES,
  EMERGENCY_SERVICES,
  WHY_HOMEEFIX,
  OPERATIONAL_PILLARS,
  HOMEEFIX_GUARANTEE_PILLARS,
  BLOG_ARTICLES,
  HOMEPAGE_FAQS,
  APP_CONFIG,
  OPERATIONAL_CITIES,
} from "@/constants/services";
import { dbRepository } from "@/services/db/repository";

/* ─── Motion Variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      delay: i * 0.06,
      ease: "easeOut" as const,
    },
  }),
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export default function Home() {
  const navigate = useNavigate();
  const { items, addItem, removeItem } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [location, setLocation] = useState("Salt Lake, Kolkata");
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [customPincode, setCustomPincode] = useState("");
  const [selectedUpcomingCity, setSelectedUpcomingCity] = useState<string | null>(null);
  const [notifyInput, setNotifyInput] = useState("");
  const [notifySuccess, setNotifySuccess] = useState<string | null>(null);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Interactive Booking Preview State
  const [previewServiceSlug, setPreviewServiceSlug] = useState("ceiling-fan-installation");
  const [previewSlot, setPreviewSlot] = useState("Morning (09:00 AM - 12:00 PM)");

  // Mobile Sticky CTA trigger
  const [showMobileSticky, setShowMobileSticky] = useState(false);
  const [realReviews, setRealReviews] = useState<any[]>([]);

  useEffect(() => {
    setRealReviews(dbRepository.getReviews());
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowMobileSticky(window.scrollY > 480);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Filtered catalogue for live search dropdown
  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return POPULAR_SERVICES.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.shortDescription.toLowerCase().includes(q) ||
        s.category.name.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleToggleAddService = (service: any) => {
    const isAlreadyAdded = items.some((i) => i.id === service.id);
    if (isAlreadyAdded) {
      removeItem(service.id);
    } else {
      addItem(service);
    }
  };

  const handleDirectBook = (service: any) => {
    if (!items.some((i) => i.id === service.id)) {
      addItem(service);
    }
    navigate(ROUTES.APP_BOOK);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`${ROUTES.SERVICES}?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate(ROUTES.SERVICES);
    }
  };

  // Selected preview service item
  const activePreviewService = useMemo(() => {
    return (
      POPULAR_SERVICES.find((s) => s.slug === previewServiceSlug) ||
      POPULAR_SERVICES[0]
    );
  }, [previewServiceSlug]);

  return (
    <div className="overflow-hidden bg-background text-foreground font-sans">
      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION (Cinematic Video, Height 680-780px Desktop)
         ───────────────────────────────────────────────────────────── */}
      <section className="relative min-h-160 md:min-h-180 lg:h-185 flex items-center bg-primary text-white overflow-hidden">
        {/* Background Cinematic Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none opacity-40 mix-blend-screen scale-105 transition-opacity duration-1000"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
        />

        {/* Localized High-Contrast Lighting (No opaque dark overlay) */}
        <div className="absolute inset-0 bg-linear-to-r from-primary/95 via-primary/85 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-linear-to-t from-primary via-transparent to-transparent pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#FF6A00]/15 blur-3xl pointer-events-none" />

        <div className="container-app relative z-10 py-12 md:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Commercial Value Proposition */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="lg:col-span-7 space-y-6 text-left"
            >
              {/* Eyebrow */}
              <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-xs font-bold tracking-wider uppercase text-orange-400">
                <Shield className="w-3.5 h-3.5 text-[#FF6A00]" />
                <span>HOME SERVICES, DONE RIGHT.</span>
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                variants={fadeUp}
                custom={1}
                className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white"
              >
                Your Home.
                <br />
                <span className="text-[#FF6A00]">Fixed Right.</span>
              </motion.h1>

              {/* Supporting Text */}
              <motion.p
                variants={fadeUp}
                custom={2}
                className="text-base sm:text-lg text-slate-200 font-normal leading-relaxed max-w-xl"
              >
                Book verified professionals for repairs, maintenance, cleaning and more—with transparent pricing, digital invoices and dependable service.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                variants={fadeUp}
                custom={3}
                className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4"
              >
                <Button
                  size="lg"
                  className="bg-[#FF6A00] hover:bg-[#E55F00] text-white font-bold text-base px-8 py-3.5 rounded-xl shadow-lg shadow-orange-500/25 active:scale-98 transition-all cursor-pointer"
                  onClick={() => navigate(ROUTES.APP_BOOK)}
                >
                  <span>Book a Service</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 bg-white/5 hover:bg-white/15 text-white font-semibold text-base px-6 py-3.5 rounded-xl backdrop-blur-md cursor-pointer"
                  onClick={() => {
                    const el = document.getElementById("categories-section");
                    el ? el.scrollIntoView({ behavior: "smooth" }) : navigate(ROUTES.SERVICES);
                  }}
                >
                  Explore Services
                </Button>

                <a
                  href="#emergency-section"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-300 hover:text-white px-3 py-2 rounded-lg transition-colors"
                >
                  <Zap className="w-3.5 h-3.5 text-[#FF6A00]" />
                  Emergency Service &rarr;
                </a>
              </motion.div>

              {/* Compact Trust Indicators (Icons with concise labels) */}
              <motion.div
                variants={fadeUp}
                custom={4}
                className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-white/10"
              >
                {[
                  { label: "Verified Professionals", icon: Shield },
                  { label: "Transparent Pricing", icon: FileText },
                  { label: "Service Warranty", icon: Sparkles },
                  { label: "Digital Invoice", icon: CheckCircle2 },
                ].map((pill, idx) => {
                  const Icon = pill.icon;
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
                    >
                      <Icon className="w-4 h-4 text-[#FF6A00] shrink-0" />
                      <span className="text-xs font-semibold text-slate-200 leading-tight">
                        {pill.label}
                      </span>
                    </div>
                  );
                })}
              </motion.div>
            </motion.div>

            {/* Right Column: Interactive Quick-Booking Preview Card (Desktop) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="hidden lg:block lg:col-span-5"
            >
              <Card className="p-6 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl text-white space-y-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Live Booking Preview
                    </span>
                  </div>
                  <Badge variant="outline" className="border-white/30 text-[11px] text-orange-300">
                    Kolkata Hub
                  </Badge>
                </div>

                {/* Service Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Choose Service
                  </label>
                  <select
                    value={previewServiceSlug}
                    onChange={(e) => setPreviewServiceSlug(e.target.value)}
                    className="w-full h-11 px-3.5 bg-slate-900/80 border border-white/20 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-[#FF6A00] cursor-pointer"
                  >
                    {POPULAR_SERVICES.map((s) => (
                      <option key={s.slug} value={s.slug} className="bg-primary text-white">
                        {s.name} — {s.pricingLabel || formatCurrency(s.discountedPrice || s.basePrice)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Professional Assignment Status */}
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="font-semibold block text-slate-200">Verified Professional</span>
                      <span className="text-[11px] text-slate-400">Assigned automatically on booking</span>
                    </div>
                  </div>
                  <span className="text-emerald-400 font-bold text-[11px]">Ready</span>
                </div>

                {/* Slot Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Available Time Slot
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      "Morning (09:00 - 12:00)",
                      "Afternoon (12:00 - 16:00)",
                      "Evening (16:00 - 20:00)",
                      "Emergency Slot (ASAP)",
                    ].map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setPreviewSlot(slot)}
                        className={cn(
                          "p-2 rounded-xl text-left border text-[11px] font-medium transition-all cursor-pointer truncate",
                          previewSlot.startsWith(slot.split(" ")[0])
                            ? "bg-[#FF6A00] border-[#FF6A00] text-white font-bold shadow-sm"
                            : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                        )}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Breakdown Preview */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Upfront Estimate</span>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-white/80 font-medium">Auto-dispatch SLA</span>
                  </div>
                  <span className="font-bold text-emerald-400">&lt; 15 mins</span>
                </div>

                {/* Direct CTA */}
                <button
                  type="button"
                  onClick={() => {
                    const found = POPULAR_SERVICES.find((s) => s.slug === previewServiceSlug) || POPULAR_SERVICES[0];
                    handleDirectBook(found);
                  }}
                  className="w-full h-12 rounded-xl bg-[#FF6A00] hover:bg-[#E55F00] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#FF6A00]/25 transition-all cursor-pointer active:scale-[0.99]"
                >
                  Confirm &amp; Proceed to Slot Selection
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. LOCATION SELECTOR & LIVE SEARCH
         ───────────────────────────────────────────────────────────── */}
      <section className="relative -mt-6 z-20 container-app">
        <div className="bg-surface border border-border/80 rounded-3xl shadow-xl p-4 sm:p-5">
          <div className="flex items-center justify-between gap-4 mb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#FF6A00]">
              What do you need help with today?
            </h2>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
            {/* Location Selector Button */}
            <button
              type="button"
              onClick={() => setShowLocationModal(true)}
              className="w-full sm:w-auto flex items-center justify-between gap-2 px-3.5 py-3 rounded-2xl bg-slate-100/90 dark:bg-slate-800/80 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold shrink-0 cursor-pointer border border-slate-200/60 dark:border-slate-700/60"
            >
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#FF6A00] shrink-0" />
                <span className="truncate max-w-32.5">{location}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Live Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                placeholder="Search for a service, e.g. fan installation, AC repair, leakage..."
                className="pl-10 pr-4 h-12 text-sm rounded-2xl border-slate-200 dark:border-slate-700 w-full"
              />

              {/* Autocomplete Dropdown */}
              <AnimatePresence>
                {searchFocused && filteredServices.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-primary border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50 divide-y divide-slate-100 dark:divide-slate-800"
                  >
                    {filteredServices.map((service) => (
                      <div
                        key={service.id}
                        className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-between gap-3 transition-colors"
                      >
                        <div className="space-y-0.5">
                          <Link
                            to={`/services/${service.category.slug}/${service.slug}`}
                            className="text-sm font-bold text-slate-900 dark:text-white hover:text-[#FF6A00] block"
                          >
                            {service.name}
                          </Link>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            {service.category.name} • {service.duration} mins • {service.pricingLabel || formatCurrency(service.discountedPrice || service.basePrice)}
                          </span>
                        </div>

                        <Button
                          size="sm"
                          className="bg-[#FF6A00] hover:bg-[#E55F00] text-white text-xs font-bold rounded-xl"
                          onClick={() => handleDirectBook(service)}
                        >
                          Book
                        </Button>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Search Submit Button */}
            <Button
              type="submit"
              className="w-full sm:w-auto h-12 px-6 bg-primary hover:bg-[#143560] text-white font-bold rounded-2xl text-sm shrink-0 cursor-pointer"
            >
              Search
            </Button>
          </form>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. SERVICE CATEGORIES (All 17 Categories, Larger Cards)
         ───────────────────────────────────────────────────────────── */}
      <section id="categories-section" className="container-app py-16 sm:py-24">
        <div className="text-center space-y-3 mb-12">
          <Badge variant="accent" className="px-3 py-1 text-xs uppercase font-bold tracking-wider">
            Explore Home Services
          </Badge>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-primary dark:text-white">
            Professional Help for Every Corner of Your Home
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            17 specialized trade categories with standard rate cards, vetted technicians, and transparent digital billing.
          </p>
        </div>

        {/* 17 Categories Grid (Desktop Grid, Mobile Horizontal Carousel) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4 lg:gap-5">
          {SERVICE_CATEGORIES.map((category) => (
            <Link
              key={category.id}
              to={`${ROUTES.SERVICES}/${category.slug}`}
              className="group block"
            >
              <Card
                hover
                className="p-5 h-full flex flex-col items-center justify-between text-center border-slate-200/80 dark:border-slate-800 hover:border-[#FF6A00] rounded-3xl transition-all duration-300 hover:shadow-lg bg-white dark:bg-slate-900/60"
              >
                <div className="space-y-3 flex flex-col items-center w-full">
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl transition-transform duration-300 group-hover:scale-110 shadow-xs"
                    style={{ backgroundColor: `${category.color}15` }}
                  >
                    {category.icon}
                  </div>

                  <div>
                    <h3 className="font-heading text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-[#FF6A00] transition-colors leading-tight">
                      {category.name}
                    </h3>
                    <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-snug">
                      {category.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 w-full flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  <span>{category.count} services</span>
                  <span className="text-[#FF6A00]">From ₹{category.startingPrice}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. POPULAR SERVICES NEAR YOU (High Visual Hierarchy)
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-slate-50 dark:bg-slate-900/40 py-16 sm:py-24 border-y border-slate-200/60 dark:border-slate-800">
        <div className="container-app">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-[#FF6A00] text-xs font-bold uppercase tracking-wider mb-2">
                <span>Most Requested</span>
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-primary dark:text-white">
                Popular Services Near You
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                Transparent rates with guaranteed service warranty and background-checked technicians.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-semibold self-start sm:self-auto"
              asChild
            >
              <Link to={ROUTES.SERVICES}>
                <span>Browse All Services</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </Button>
          </div>

          {/* Cards Grid (3 or 4 per row desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {POPULAR_SERVICES.map((service) => (
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
          5. EMERGENCY SECTION (Restrained Navy + Orange Palette)
         ───────────────────────────────────────────────────────────── */}
      <section id="emergency-section" className="container-app py-16">
        <div className="relative overflow-hidden rounded-3xl bg-primary border border-orange-500/30 text-white p-8 sm:p-12 shadow-xl">
          {/* Subtle warm accent lighting */}
          <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-[#FF6A00]/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Emergency Information */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider">
                <AlertTriangle className="w-3.5 h-3.5 text-[#FF6A00]" />
                <span>Priority Emergency Dispatch</span>
              </div>

              <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Home Emergency?
                <br />
                <span className="text-[#FF6A00]">Get help when you need it.</span>
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                Emergency service is available for eligible categories (pipe bursts, total blackouts, lockouts) across Kolkata operational hubs. Starting inspection fee: ₹499.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  size="lg"
                  className="bg-[#FF6A00] hover:bg-[#E55F00] text-white font-bold text-sm sm:text-base px-6 py-3.5 rounded-xl shadow-lg shadow-orange-500/25 cursor-pointer"
                  onClick={() => navigate(`${ROUTES.APP_BOOK}?emergency=true`)}
                >
                  Request Emergency Service
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 bg-white/5 hover:bg-white/10 text-white text-sm sm:text-base px-5 py-3.5 rounded-xl"
                  onClick={() => window.open(`tel:${APP_CONFIG.supportPhone}`)}
                >
                  <Phone className="w-4 h-4 mr-2 text-[#FF6A00]" />
                  Call Hotline: 1800-123-4567
                </Button>
              </div>
            </div>

            {/* Right Emergency Category Tiles */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              {EMERGENCY_SERVICES.map((emg) => (
                <div
                  key={emg.id}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3 hover:bg-white/10 transition-colors"
                >
                  <span className="text-2xl p-2 rounded-xl bg-white/5 shrink-0">{emg.icon}</span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">{emg.title}</h4>
                    <p className="text-[11px] text-slate-300 leading-tight mt-0.5">{emg.description}</p>
                    <span className="inline-block mt-1 text-[10px] font-semibold text-orange-300">
                      Standard Inspection: ₹{emg.baseInspectionFee}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. WHY HOME-E-FIX? (4 Core Pillars + 4 Operational Points)
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-slate-50 dark:bg-slate-900/40 py-16 sm:py-24 border-y border-slate-200/60 dark:border-slate-800">
        <div className="container-app text-center">
          <Badge variant="accent" className="mb-3 px-3 py-1 uppercase font-bold text-xs">
            Why Home-e-Fix?
          </Badge>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-primary dark:text-white">
            Built on Standards. Backed by Trust.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            We built Home-e-Fix to remove stress, guesswork, and unreliability from Indian home maintenance.
          </p>

          {/* 4 Main Pillars */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_HOMEEFIX.map((pillar) => (
              <Card
                key={pillar.id}
                hover
                className="p-6 text-left space-y-3.5 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 rounded-3xl"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-2xl text-[#FF6A00]">
                  {pillar.icon}
                </div>
                <h3 className="font-heading text-base font-bold text-primary dark:text-white">
                  {pillar.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {pillar.description}
                </p>
                <div className="inline-block text-[11px] font-bold text-[#FF6A00] bg-orange-500/10 px-2.5 py-1 rounded-full">
                  {pillar.highlight}
                </div>
              </Card>
            ))}
          </div>

          {/* 4 Operational Points */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-slate-200/60 dark:border-slate-800">
            {OPERATIONAL_PILLARS.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-left space-y-1"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</h4>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-6 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. HOW HOME-E-FIX WORKS (4 Sequential Steps)
         ───────────────────────────────────────────────────────────── */}
      <section className="container-app py-16 sm:py-24">
        <div className="text-center space-y-3 mb-14">
          <Badge variant="accent" className="px-3 py-1 uppercase font-bold text-xs">
            Simple Process
          </Badge>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-primary dark:text-white">
            How Home-e-Fix Works
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
            Book professional service in 4 simple, transparent steps.
          </p>
        </div>

        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              step: "01",
              title: "Choose a Service",
              desc: "Browse from 100+ verified home repair & maintenance services with upfront fixed rates.",
            },
            {
              step: "02",
              title: "Pick Your Time",
              desc: "Select your preferred date, convenient time slot, and service address.",
            },
            {
              step: "03",
              title: "Meet Your Professional",
              desc: "Track your assigned background-checked technician arriving on time with tools.",
            },
            {
              step: "04",
              title: "Relax — We Handle the Rest",
              desc: "Inspect the completed job and pay securely via cash, UPI, or card with digital receipt.",
            },
          ].map((item, idx) => (
            <div
              key={item.step}
              className="relative text-center p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-[#FF6A00] font-heading font-extrabold text-base shadow-sm">
                {item.step}
              </div>
              <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          8. THE HOME-E-FIX GUARANTEE (High Trust Visual Section)
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-primary text-white py-16 sm:py-24 border-y border-white/10 relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-[#FF6A00]/10 blur-3xl pointer-events-none" />

        <div className="container-app relative z-10">
          <div className="mx-auto max-w-3xl text-center mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-[#FF6A00] text-xs font-bold uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" />
              <span>Platform Commitment</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-white">
              The Home-e-Fix Guarantee
            </h2>
            <p className="text-sm sm:text-base text-slate-300">
              From verified professionals to transparent pricing and digital invoices, every booking is designed around trust.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {HOMEEFIX_GUARANTEE_PILLARS.map((pillar, idx) => (
              <div
                key={idx}
                className="p-5 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md space-y-2.5 text-left"
              >
                <div className="text-2xl mb-1">{pillar.icon}</div>
                <h3 className="font-heading text-sm sm:text-base font-bold text-white">
                  {pillar.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          9. CUSTOMER REVIEWS (Authentic Homeowner Reviews)
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-slate-50 dark:bg-slate-900/40 py-16 sm:py-24 border-b border-slate-200/60 dark:border-slate-800">
        <div className="container-app">
          <div className="text-center space-y-3 mb-12">
            <Badge variant="accent" className="px-3 py-1 uppercase font-bold text-xs">
              Verified Feedback
            </Badge>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-primary dark:text-white">
              Loved by Homeowners
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Authentic reviews from verified homeowners following completed jobs.
            </p>
          </div>

          {realReviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {realReviews.map((t, idx) => (
                <Card
                  key={t.id || idx}
                  hover
                  className="p-6 bg-white dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 rounded-3xl flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: t.rating || 5 }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 italic leading-relaxed">
                      &ldquo;{t.comment}&rdquo;
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t.userName || "Verified Homeowner"}</h4>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{t.serviceName || "Home Service"}</span>
                    </div>
                    <Badge variant="success" className="text-[10px] font-semibold">
                      Verified Job
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 bg-white dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 rounded-3xl space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">100% Background Verified</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Every specialist completes Aadhaar KYC, police verification, and trade credential validation before taking live bookings.
                </p>
                <div className="pt-2">
                  <Badge variant="outline" className="text-[10px] font-medium text-slate-500">
                    Strict Verification SLA
                  </Badge>
                </div>
              </Card>

              <Card className="p-6 bg-white dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 rounded-3xl space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary dark:text-orange-400 flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Standardized Rate Cards</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Clear upfront labor rates, authentic replacement parts, and automated digital GST invoices. Zero on-site bargaining.
                </p>
                <div className="pt-2">
                  <Badge variant="outline" className="text-[10px] font-medium text-slate-500">
                    Zero Hidden Charges
                  </Badge>
                </div>
              </Card>

              <Card className="p-6 bg-white dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 rounded-3xl space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">30-Day Workmanship Cover</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Every completed job is backed by our 30-day rework warranty. If anything isn't right, we re-inspect and fix it at zero extra charge.
                </p>
                <div className="pt-2">
                  <Badge variant="outline" className="text-[10px] font-medium text-slate-500">
                    Home-e-Fix Protection
                  </Badge>
                </div>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          10. MAINTENANCE CONTENT & TIPS (Articles)
         ───────────────────────────────────────────────────────────── */}
      <section className="container-app py-16 sm:py-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <Badge variant="accent" className="mb-2 px-3 py-1 uppercase font-bold text-xs">
              Home Maintenance Guide
            </Badge>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-primary dark:text-white">
              Home Maintenance Tips & Best Practices
            </h2>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to={ROUTES.BLOG}>Browse All Guides</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {BLOG_ARTICLES.map((article) => (
            <Card
              key={article.id}
              hover
              className="overflow-hidden flex flex-col h-full rounded-3xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60"
            >
              <div className="aspect-16/10 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={article.image}
                  alt={article.title}
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-bold text-[#FF6A00]">{article.category}</span>
                    <span>{article.readTime}</span>
                  </div>
                  <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {article.snippet}
                  </p>
                </div>

                <div className="pt-2 text-xs font-bold text-[#FF6A00] flex items-center gap-1 cursor-pointer hover:underline">
                  Read Guide <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          11. MEMBERSHIP SHOWCASE (Home-e-Fix PLUS)
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-slate-50 dark:bg-slate-900/40 py-16 sm:py-24 border-y border-slate-200/60 dark:border-slate-800">
        <div className="container-app max-w-4xl">
          <div className="p-8 sm:p-12 rounded-3xl bg-primary border border-orange-500/30 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#FF6A00]/20 blur-3xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-orange-400 text-xs font-bold uppercase tracking-wider">
                  <Crown className="w-3.5 h-3.5 text-[#FF6A00]" />
                  <span>VIP Home Care</span>
                </div>

                <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-white">
                  Home-e-Fix <span className="text-[#FF6A00]">PLUS</span>
                </h2>

                <p className="text-sm text-slate-300 leading-relaxed">
                  Join our annual home care membership starting at ₹99/month or ₹999/year for priority bookings and guaranteed savings.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs text-slate-200">
                  {[
                    "Priority Booking Queue",
                    "Annual Home Health Checkup",
                    "15% Discount on Labour",
                    "Extended 60-Day Warranty",
                    "Dedicated Account Manager",
                  ].map((benefit) => (
                    <div key={benefit} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#FF6A00] shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>

                {/* Dynamic User Authentication Membership State */}
                {isAuthenticated && user && (
                  <div className="p-3 rounded-xl bg-white/10 border border-white/15 text-xs text-slate-200 mt-2">
                    <span className="font-semibold block">Account Status:</span>
                    <span className="text-[#FF6A00] font-bold">
                      Standard Homeowner (Eligible for PLUS VIP Upgrade)
                    </span>
                  </div>
                )}
              </div>

              <div className="md:col-span-4 text-center md:text-right space-y-4">
                <div className="p-5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md inline-block text-center w-full max-w-60">
                  <span className="text-xs text-slate-300 block uppercase tracking-wider">Starting at</span>
                  <span className="font-heading text-3xl font-extrabold text-white block my-1">
                    ₹99<span className="text-xs font-normal text-slate-300">/mo</span>
                  </span>
                  <span className="text-[11px] text-orange-300 block">Or ₹999 billed annually</span>
                </div>

                <div>
                  <Button
                    size="lg"
                    className="w-full bg-[#FF6A00] hover:bg-[#E55F00] text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 cursor-pointer"
                    asChild
                  >
                    <Link to={ROUTES.MEMBERSHIP}>Explore PLUS</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          12. FREQUENTLY ASKED QUESTIONS (Accessible Accordion)
         ───────────────────────────────────────────────────────────── */}
      <section className="container-app py-16 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <div className="text-center space-y-3 mb-12">
            <Badge variant="accent" className="px-3 py-1 uppercase font-bold text-xs">
              Clear Policies
            </Badge>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-primary dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Genuine operational guidelines on verification, pricing, warranty, and cancellations.
            </p>
          </div>

          <div className="space-y-3.5">
            {HOMEPAGE_FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;

              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between p-5 text-left font-heading text-sm sm:text-base font-bold text-primary dark:text-white hover:text-[#FF6A00] dark:hover:text-[#FF6A00] transition-colors cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 text-slate-400 transition-transform duration-200 shrink-0 ml-4",
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
                        <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
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
          13. FINAL BOOKING CTA SECTION
         ───────────────────────────────────────────────────────────── */}
      <section className="container-app py-12 pb-20">
        <div className="rounded-3xl bg-linear-to-r from-primary to-[#143560] text-white p-8 sm:p-14 text-center space-y-6 relative overflow-hidden shadow-2xl border border-white/10">
          <div className="mx-auto max-w-2xl space-y-3">
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-white">
              Your home deserves better care.
            </h2>
            <p className="text-sm sm:text-base text-slate-200">
              Book trusted professionals with Home-e-Fix. Transparent pricing, verified tradesmen, and dependable warranty on every job.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-[#FF6A00] hover:bg-[#E55F00] text-white font-bold text-base px-8 py-3.5 rounded-xl shadow-lg shadow-orange-500/25 cursor-pointer"
              asChild
            >
              <Link to={ROUTES.APP_BOOK}>Book a Service</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold text-base px-6 py-3.5 rounded-xl"
              asChild
            >
              <Link to={ROUTES.BECOME_A_PROFESSIONAL}>Become a Professional</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          14. MOBILE STICKY BOOKING ACTION BAR (Appears on Scroll)
         ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showMobileSticky && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden fixed bottom-14 inset-x-0 z-40 p-3 bg-white/95 dark:bg-[#07172E]/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-2xl"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6A00] block">
                  Quick Booking
                </span>
                <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                  Fixed Upfront Pricing
                </span>
              </div>
              <Button
                size="sm"
                className="bg-[#FF6A00] hover:bg-[#E55F00] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md cursor-pointer"
                onClick={() => navigate(ROUTES.APP_BOOK)}
              >
                Book a Service
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────
          15. LOCATION SELECTOR DIALOG MODAL
         ───────────────────────────────────────────────────────────── */}
      <Dialog open={showLocationModal} onClose={() => setShowLocationModal(false)} size="md">
        <DialogHeader onClose={() => setShowLocationModal(false)}>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-[#FF6A00]" />
            <DialogTitle>Select Your Service Location</DialogTitle>
          </div>
        </DialogHeader>
        <DialogContent className="space-y-5">
          {/* Active Startup Notice */}
          <div className="p-3.5 rounded-2xl bg-orange-500/10 border border-orange-500/20 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-[#FF6A00]">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              Home-e-Fix Kolkata HQ & Live Operations
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Operating across all Kolkata and Howrah operational hubs with background-verified technicians and standard rate cards.
            </p>
          </div>

          {/* Live Kolkata Hubs */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
              🟢 Live Hubs in Kolkata
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {OPERATIONAL_CITIES.activeHubs.map((hub) => (
                <button
                  key={hub.id}
                  type="button"
                  onClick={() => {
                    setLocation(`${hub.name}, Kolkata`);
                    setShowLocationModal(false);
                    setSelectedUpcomingCity(null);
                  }}
                  className={cn(
                    "p-2.5 rounded-xl border text-xs font-medium text-left transition-all cursor-pointer flex items-center gap-1.5",
                    location.startsWith(hub.name)
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

          {/* Upcoming Cities */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
              🚀 Expanding Soon
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {OPERATIONAL_CITIES.upcomingCities.map((city) => (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => {
                    setSelectedUpcomingCity(city.name);
                    setNotifySuccess(null);
                  }}
                  className={cn(
                    "p-2.5 rounded-xl border text-xs font-medium text-left transition-all cursor-pointer flex flex-col justify-between",
                    selectedUpcomingCity === city.name
                      ? "border-[#FF6A00] bg-orange-500/10 text-[#FF6A00] font-bold"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-500"
                  )}
                >
                  <span className="font-semibold text-slate-900 dark:text-white">{city.name}</span>
                  <span className="text-[10px] text-[#FF6A00] font-normal mt-0.5">{city.status}</span>
                </button>
              ))}
            </div>

            {selectedUpcomingCity && (
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-orange-500/30 space-y-2.5 mt-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Get notified when Home-e-Fix launches in {selectedUpcomingCity}!
                </span>
                {notifySuccess ? (
                  <div className="text-xs font-semibold text-emerald-600 bg-emerald-500/10 p-2.5 rounded-xl">
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

          {/* Custom Area Input */}
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
                    setLocation(`${customPincode.trim()}, Kolkata`);
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
