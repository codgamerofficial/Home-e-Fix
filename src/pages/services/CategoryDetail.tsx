import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Shield,
  CheckCircle,
  Sparkles,
  ChevronDown,
  Wrench,
  Award,
  Zap,
  ArrowRight,
  Search,
  Receipt,
  Moon,
  Droplets,
  Wind,
  Hammer,
  Paintbrush,
  HardHat,
  Maximize2,
  LayoutGrid,
  Grid,
  UtensilsCrossed,
  ShieldAlert,
  Camera,
  Cpu,
  Home as HomeIcon,
  ClipboardCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { ServiceCard } from "@/components/ui/service-card";
import { TechnicianCard } from "@/components/ui/technician-card";
import { ROUTES } from "@/constants/routes";
import {
  SERVICE_CATEGORIES,
  CATEGORY_SERVICES_MAP,
  CATEGORY_FAQS_MAP,
} from "@/constants/services";
import { dbRepository } from "@/services/db/repository";
import { cn, formatCurrency } from "@/lib/utils";

const CATEGORY_ICON_MAP: Record<string, React.ElementType> = {
  electrical: Zap,
  plumbing: Droplets,
  carpentry: Hammer,
  ac: Wind,
  "ac-repair": Wind,
  hvac: Wind,
  cleaning: Sparkles,
  painting: Paintbrush,
  civil: HardHat,
  "false-ceiling": Maximize2,
  flooring: LayoutGrid,
  glass: Grid,
  "modular-kitchen": UtensilsCrossed,
  appliances: Wrench,
  "pest-control": ShieldAlert,
  security: Camera,
  "smart-home": Cpu,
  "interior-repair": HomeIcon,
  inspection: ClipboardCheck,
};

export default function CategoryDetail() {
  const { categorySlug, category: paramCategory } = useParams<{ categorySlug?: string; category?: string }>();
  const activeCategorySlug = categorySlug || paramCategory;
  const navigate = useNavigate();

  // Find category details
  const category =
    SERVICE_CATEGORIES.find((c) => c.slug === activeCategorySlug || c.id === activeCategorySlug) ||
    SERVICE_CATEGORIES[0];
  const categoryServices = CATEGORY_SERVICES_MAP[category.slug] || CATEGORY_SERVICES_MAP.electrical;
  const categoryFaqs = CATEGORY_FAQS_MAP[category.slug] || CATEGORY_FAQS_MAP.electrical;

  const [realTechnicians, setRealTechnicians] = useState<any[]>([]);
  const [selectedServices, setSelectedServices] = useState<Record<string, any>>({});
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [showWarrantyModal, setShowWarrantyModal] = useState(false);
  const [techNotice, setTechNotice] = useState<string | null>(null);
  const [activeSubCategory, setActiveSubCategory] = useState<string>("ALL");
  const [serviceSearch, setServiceSearch] = useState<string>("");

  useEffect(() => {
    setActiveSubCategory("ALL");
    setServiceSearch("");
  }, [activeCategorySlug]);

  const subCategories = useMemo(() => {
    return Array.from(new Set(categoryServices.map((s: any) => s.subCategory).filter(Boolean))) as string[];
  }, [categoryServices]);

  const displayedServices = useMemo(() => {
    let list = categoryServices;
    if (activeSubCategory !== "ALL") {
      list = list.filter((s: any) => s.subCategory === activeSubCategory);
    }
    if (serviceSearch) {
      const q = serviceSearch.toLowerCase();
      list = list.filter((s: any) =>
        s.name.toLowerCase().includes(q) ||
        (s.shortDescription && s.shortDescription.toLowerCase().includes(q))
      );
    }
    return list;
  }, [categoryServices, activeSubCategory, serviceSearch]);

  useEffect(() => {
    const pros = dbRepository.getProfessionals();
    const matched = pros.filter(
      (p: any) =>
        p.category?.toLowerCase() === category.name.toLowerCase() ||
        p.category?.toLowerCase() === category.slug.toLowerCase() ||
        (p.skills && p.skills.some((s: string) => s.toLowerCase().includes(category.slug.toLowerCase())))
    );
    setRealTechnicians(matched.length > 0 ? matched : pros);
  }, [category]);

  const toggleSelectService = (service: any) => {
    setSelectedServices((prev) => {
      const copy = { ...prev };
      if (copy[service.id]) {
        delete copy[service.id];
      } else {
        copy[service.id] = service;
      }
      return copy;
    });
  };

  const selectedCount = Object.keys(selectedServices).length;
  const subtotal = Object.values(selectedServices).reduce(
    (sum, item) => sum + (item.discountedPrice || item.basePrice || 0),
    0
  );

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* ─── 1. CATEGORY HERO BANNER ─── */}
      <section className="relative overflow-hidden gradient-hero text-white py-12 sm:py-16">
        <div className="container-app">
          <Link
            to={ROUTES.SERVICES}
            className="inline-flex items-center gap-1.5 text-xs text-white/80 hover:text-white mb-6 transition-colors font-medium"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Catalogue
          </Link>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:items-center">
            <div className="md:col-span-8 space-y-4">
              <div className="flex items-center gap-3">
                {(() => {
                  const IconComp = CATEGORY_ICON_MAP[category.slug] || Wrench;
                  return (
                    <div
                      className="h-14 w-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-white/20"
                      style={{ backgroundColor: `${category.color}30` }}
                    >
                      <IconComp className="h-7 w-7 text-white" />
                    </div>
                  );
                })()}
                <div>
                  <Badge variant="accent" className="mb-1 text-[11px]">
                    Verified Professionals
                  </Badge>
                  <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-white">
                    {category.name} Services
                  </h1>
                </div>
              </div>

              <p className="text-sm sm:text-base text-white/85 max-w-2xl leading-relaxed">
                {category.description}
              </p>

              {/* Key Specs Pills */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-xs font-medium text-white border border-white/15">
                  <Sparkles className="h-3.5 w-3.5 text-accent" />
                  Starting at {formatCurrency(category.startingPrice)}
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-xs font-medium text-white border border-white/15">
                  <Clock className="h-3.5 w-3.5 text-accent" />
                  Avg Time: {category.estimatedTime}
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-xs font-medium text-white border border-white/15">
                  <Shield className="h-3.5 w-3.5 text-accent" />
                  30-Day Warranty
                </div>
              </div>
            </div>

            {/* Banner Quick Card */}
            <div className="md:col-span-4 hidden md:block">
              <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md space-y-3">
                <h4 className="font-heading text-sm font-bold text-white flex items-center gap-2">
                  <Award className="h-4 w-4 text-accent" /> Why Book {category.name}?
                </h4>
                <ul className="text-xs text-white/80 space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-accent shrink-0" />
                    Police verified & certified tradesmen
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-accent shrink-0" />
                    100% genuine spare parts guarantee
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-accent shrink-0" />
                    Upfront fixed price quote
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. SERVICES LIST UNDER THIS CATEGORY ─── */}
      <section className="container-app py-12 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-bold text-primary">
              Available {category.name} Services
            </h2>
            <p className="text-xs sm:text-sm text-foreground-secondary">
              Select items to add to your service booking • Standard labor pricing with genuine spares
            </p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-foreground-muted" />
              <input
                type="text"
                placeholder={`Search ${category.name}...`}
                value={serviceSearch}
                onChange={(e) => setServiceSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-border bg-surface text-foreground placeholder:text-foreground-muted focus:outline-hidden focus:ring-2 focus:ring-accent"
              />
            </div>
            <span className="text-xs font-semibold text-foreground-muted bg-surface border border-border px-3 py-1.5 rounded-full shrink-0">
              {displayedServices.length} Options
            </span>
          </div>
        </div>

        {/* SUB-CATEGORY PILLS */}
        {subCategories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveSubCategory("ALL")}
              className={`px-3.5 py-1.5 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer ${
                activeSubCategory === "ALL"
                  ? "bg-primary text-white shadow-xs"
                  : "bg-surface border border-border text-foreground-secondary hover:border-accent/40"
              }`}
            >
              All Services ({categoryServices.length})
            </button>
            {subCategories.map((sub: string) => {
              const count = categoryServices.filter((s: any) => s.subCategory === sub).length;
              const isActive = activeSubCategory === sub;
              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setActiveSubCategory(sub)}
                  className={`px-3.5 py-1.5 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-accent text-white shadow-xs"
                      : "bg-surface border border-border text-foreground-secondary hover:border-accent/40"
                  }`}
                >
                  {sub} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* RATE CARD TRANSPARENCY CARD */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-surface border border-border/70 text-xs">
          <div className="space-y-0.5">
            <div className="text-[10px] text-foreground-muted uppercase font-bold flex items-center gap-1">
              <Zap className="h-3 w-3 text-amber-500" /> Visiting Fee
            </div>
            <div className="font-semibold text-primary">₹49–₹99 (Waived)</div>
            <div className="text-[10px] text-foreground-secondary line-clamp-1">100% waived on service approval</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-[10px] text-foreground-muted uppercase font-bold flex items-center gap-1">
              <Shield className="h-3 w-3 text-emerald-500" /> Service Warranty
            </div>
            <div className="font-semibold text-primary">30-Day Guarantee</div>
            <div className="text-[10px] text-foreground-secondary line-clamp-1">On eligible completed repairs</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-[10px] text-foreground-muted uppercase font-bold flex items-center gap-1">
              <Receipt className="h-3 w-3 text-blue-500" /> Taxation
            </div>
            <div className="font-semibold text-primary">18% GST Extra</div>
            <div className="text-[10px] text-foreground-secondary line-clamp-1">Calculated on net labor</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-[10px] text-foreground-muted uppercase font-bold flex items-center gap-1">
              <Moon className="h-3 w-3 text-purple-500" /> Night Surcharge
            </div>
            <div className="font-semibold text-primary">Flat ₹150</div>
            <div className="text-[10px] text-foreground-secondary line-clamp-1">Applies post 8:00 PM only</div>
          </div>
        </div>

        {/* SERVICES GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedServices.map((service: any) => (
            <ServiceCard
              key={service.id}
              service={service}
              isAdded={Boolean(selectedServices[service.id])}
              onAdd={toggleSelectService}
              onRemove={toggleSelectService}
              onBookNow={(s) => navigate(`${ROUTES.APP_BOOK}?service=${encodeURIComponent(s.slug || s.id)}`)}
            />
          ))}
        </div>

        {displayedServices.length === 0 && (
          <div className="text-center py-12 border border-dashed border-border rounded-2xl bg-surface/50">
            <Wrench className="h-8 w-8 text-foreground-muted mx-auto mb-2" />
            <p className="text-sm font-semibold text-primary">No services found</p>
            <p className="text-xs text-foreground-secondary mt-1">Try clearing your search or picking another sub-category</p>
          </div>
        )}
      </section>

      {/* ─── 3. CATEGORY WARRANTY & PROTECTION ─── */}
      <section className="bg-surface py-12 border-y border-border">
        <div className="container-app">
          <div className="rounded-2xl border border-accent/20 bg-accent/5 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-accent">
                <Shield className="h-4 w-4" /> Home-e-Fix Warranty Standard
              </div>
              <h3 className="font-heading text-xl font-bold text-primary">
                {category.warranty}
              </h3>
              <p className="text-xs text-foreground-secondary max-w-xl">
                Not satisfied with the repair or installation? Request a free revisit through the app within 30 days, and our senior technician will re-fix it completely free.
              </p>
            </div>

            <Button
              variant="accent"
              size="default"
              onClick={() => setShowWarrantyModal(true)}
            >
              Warranty Details
            </Button>
          </div>
        </div>
      </section>

      {/* ─── 4. ASSIGNED / TOP TECHNICIANS ─── */}
      <section className="container-app py-12">
        <div className="mb-8">
          <Badge variant="accent" className="mb-2">
            Verified Professionals
          </Badge>
          <h2 className="font-heading text-2xl font-bold text-primary">
            {category.name} Specialists
          </h2>
          <p className="text-xs sm:text-sm text-foreground-secondary">
            Verified, police checked, and trained specialists dispatched on demand
          </p>
        </div>

        {realTechnicians.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {realTechnicians.map((tech: any) => (
              <TechnicianCard
                key={tech.id}
                technician={{
                  displayName: tech.name,
                  status: tech.status || "available",
                  experience: tech.experienceYears || 5,
                  rating: tech.rating,
                  reviewCount: tech.reviewCount || 0,
                  completedJobs: tech.completedJobsCount || 0,
                  serviceRadius: tech.serviceRadiusKm || 10,
                  specializations: tech.skills || [category.name],
                  verificationStatus: tech.verificationStatus || "verified",
                  avatar: tech.avatarUrl,
                }}
                onSelect={() => {
                  setTechNotice(`✅ Specialist ${tech.name} requested for your booking assignment.`);
                  setTimeout(() => setTechNotice(null), 5000);
                }}
              />
            ))}
          </div>
        ) : (
          <Card className="p-8 border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 rounded-3xl text-center max-w-xl mx-auto space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Zap className="w-7 h-7" />
            </div>
            <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
              Dynamic Hub Dispatch Active
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Specialists are dynamically allocated from our central Kolkata hubs upon slot confirmation based on proximity, trade certification, and live availability.
            </p>
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-4 h-4" /> 100% Background Verified & Insured
            </div>
          </Card>
        )}

        {techNotice && (
          <div className="mt-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-semibold flex items-center justify-between">
            <span>{techNotice}</span>
            <button onClick={() => setTechNotice(null)} className="font-bold text-xs">Dismiss</button>
          </div>
        )}
      </section>

      {/* ─── 5. CATEGORY FAQS ─── */}
      <section className="bg-surface py-12 border-t border-border">
        <div className="container-app max-w-3xl">
          <div className="text-center mb-8">
            <Badge variant="accent" className="mb-2">
              FAQs
            </Badge>
            <h2 className="font-heading text-2xl font-bold text-primary">
              {category.name} FAQs
            </h2>
          </div>

          <div className="space-y-3">
            {categoryFaqs.map((faq: any, idx: number) => {
              const isOpen = openFaqIndex === idx;

              return (
                <div
                  key={idx}
                  className="rounded-xl border border-border bg-background overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between p-4 text-left font-heading text-sm font-semibold text-primary hover:text-accent cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-foreground-muted transition-transform shrink-0 ml-3",
                        isOpen && "rotate-180 text-accent"
                      )}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        <div className="px-4 pb-4 text-xs text-foreground-secondary leading-relaxed border-t border-border/40 pt-2">
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

      {/* ─── 6. STICKY BOOKING CART BAR ─── */}
      <AnimatePresence>
        {selectedCount > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-20 md:bottom-6 left-4 right-4 z-40 max-w-3xl mx-auto"
          >
            <div className="rounded-2xl bg-linear-to-r from-primary-dark via-primary to-primary-light text-white p-4 shadow-2xl border border-white/20 flex items-center justify-between backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center font-bold text-white shadow-glow">
                  {selectedCount}
                </div>
                <div>
                  <p className="text-xs text-white/80">Subtotal ({selectedCount} items)</p>
                  <h4 className="font-heading text-lg font-bold text-white!">
                    {formatCurrency(subtotal)}
                  </h4>
                </div>
              </div>

              <Button
                variant="accent"
                size="default"
                rightIcon={<ArrowRight className="h-4 w-4" />}
                onClick={() => navigate(ROUTES.BOOKING)}
                className="font-bold shadow-lg"
              >
                Book Now
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── WARRANTY DETAILS DIALOG MODAL ─── */}
      <Dialog open={showWarrantyModal} onClose={() => setShowWarrantyModal(false)} size="md">
        <DialogHeader onClose={() => setShowWarrantyModal(false)}>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-accent" />
            <DialogTitle>Home-e-Fix 30-Day Protection Guarantee</DialogTitle>
          </div>
        </DialogHeader>
        <DialogContent className="space-y-4 text-xs text-foreground-secondary leading-relaxed">
          <p>
            Every <strong>{category.name}</strong> service booked through Home-e-Fix includes our comprehensive 30-day workmanship and spare parts warranty.
          </p>
          <div className="p-3.5 rounded-xl bg-muted border border-border space-y-2">
            <h5 className="font-bold text-primary flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-accent" /> Free Re-visit Guarantee
            </h5>
            <p>
              If the issue reoccurs within 30 days of completion, our senior technician will re-inspect and fix it with zero service charges or labor fees.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-muted border border-border space-y-2">
            <h5 className="font-bold text-primary flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-accent" /> Genuine Parts Promise
            </h5>
            <p>
              All replacement parts supplied by Home-e-Fix are 100% brand-certified original spares with manufacturer warranty tags.
            </p>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="accent" size="sm" onClick={() => setShowWarrantyModal(false)}>
            Got it, thanks!
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
