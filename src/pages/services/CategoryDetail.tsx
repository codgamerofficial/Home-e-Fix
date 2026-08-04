import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Shield,
  Star,
  CheckCircle,
  Phone,
  Sparkles,
  ChevronDown,
  Wrench,
  Award,
  Zap,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ServiceCard } from "@/components/ui/service-card";
import { TechnicianCard } from "@/components/ui/technician-card";
import { ReviewCard } from "@/components/ui/review-card";
import { ROUTES } from "@/constants/routes";
import {
  SERVICE_CATEGORIES,
  CATEGORY_SERVICES_MAP,
  CATEGORY_TECHNICIANS_MAP,
  CATEGORY_FAQS_MAP,
  TESTIMONIALS,
} from "@/constants/services";
import { cn, formatCurrency } from "@/lib/utils";

export default function CategoryDetail() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const navigate = useNavigate();

  // Find category details
  const category = SERVICE_CATEGORIES.find((c) => c.slug === categorySlug) || SERVICE_CATEGORIES[0];
  const categoryServices = CATEGORY_SERVICES_MAP[category.slug] || CATEGORY_SERVICES_MAP.electrical;
  const categoryTechnicians = CATEGORY_TECHNICIANS_MAP[category.slug] || CATEGORY_TECHNICIANS_MAP.electrical;
  const categoryFaqs = CATEGORY_FAQS_MAP[category.slug] || CATEGORY_FAQS_MAP.electrical;

  const [selectedServices, setSelectedServices] = useState<Record<string, any>>({});
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

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
                <div
                  className="h-14 w-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-white/20"
                  style={{ backgroundColor: `${category.color}30` }}
                >
                  {category.icon}
                </div>
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
      <section className="container-app py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="font-heading text-2xl font-bold text-primary">
              Available {category.name} Services
            </h2>
            <p className="text-xs sm:text-sm text-foreground-secondary">
              Select items to add to your service booking
            </p>
          </div>
          <span className="text-xs font-semibold text-foreground-muted bg-surface border border-border px-3 py-1 rounded-full">
            {categoryServices.length} Options
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryServices.map((service: any) => (
            <ServiceCard
              key={service.id}
              service={service}
              isAdded={Boolean(selectedServices[service.id])}
              onAdd={toggleSelectService}
              onRemove={toggleSelectService}
            />
          ))}
        </div>
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
              onClick={() => alert("30-Day Warranty terms applied to all items!")}
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
            Local Experts
          </Badge>
          <h2 className="font-heading text-2xl font-bold text-primary">
            Top Rated {category.name} Technicians Nearby
          </h2>
          <p className="text-xs sm:text-sm text-foreground-secondary">
            Verified, police checked, and trained specialists ready for dispatch
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryTechnicians.map((tech: any) => (
            <TechnicianCard
              key={tech.id}
              technician={tech}
              onSelect={() => alert(`Assigned ${tech.displayName} to your booking preference!`)}
            />
          ))}
        </div>
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
            className="fixed bottom-4 left-4 right-4 z-40 max-w-3xl mx-auto"
          >
            <div className="rounded-2xl bg-primary text-white p-4 shadow-2xl border border-white/20 flex items-center justify-between backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center font-bold text-white shadow-glow">
                  {selectedCount}
                </div>
                <div>
                  <p className="text-xs text-white/70">Subtotal ({selectedCount} items)</p>
                  <h4 className="font-heading text-lg font-bold text-white">
                    {formatCurrency(subtotal)}
                  </h4>
                </div>
              </div>

              <Button
                variant="accent"
                size="default"
                rightIcon={<ArrowRight className="h-4 w-4" />}
                onClick={() => alert(`Proceeding to Booking Flow with ${selectedCount} items!`)}
                className="font-bold shadow-lg"
              >
                Book Now
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
