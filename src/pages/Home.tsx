import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Shield,
  Clock,
  Star,
  CheckCircle,
  Phone,
  Sparkles,
  ChevronDown,
  Smartphone,
  QrCode,
  Award,
  Zap,
  Users,
  Check,
  Building,
  Wrench,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/ui/search-bar";
import { ServiceCard } from "@/components/ui/service-card";
import { MembershipCard } from "@/components/ui/membership-card";
import { ReviewCard } from "@/components/ui/review-card";
import { ROUTES } from "@/constants/routes";
import {
  SERVICE_CATEGORIES,
  POPULAR_SERVICES,
  EMERGENCY_SERVICES,
  WHY_HOMEEFIX,
  HOMEEFIX_PROMISE,
  TESTIMONIALS,
  BLOG_ARTICLES,
  HOMEPAGE_FAQS,
  APP_CONFIG,
} from "@/constants/services";

/* ─── Framer Motion Animation Variants ─── */

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: i * 0.08,
      ease: "easeOut" as const,
    },
  }),
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [addedServices, setAddedServices] = useState<Record<string, boolean>>({});
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [location, setLocation] = useState("Hitech City, Hyderabad");

  const searchSuggestions = [
    "AC Deep Cleaning & Service",
    "Bathroom Plumbing Repair",
    "Switch & MCB Installation",
    "Sofa Shampoo Cleaning",
    "Cockroach Pest Control",
    "Door Lock Repair",
  ];

  const handleToggleAddService = (service: any) => {
    setAddedServices((prev) => ({
      ...prev,
      [service.id]: !prev[service.id],
    }));
  };

  const handleSearchSubmit = (query: string) => {
    if (query.trim()) {
      navigate(`${ROUTES.SERVICES}?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="overflow-hidden bg-background">
      {/* ─── 1. HERO SECTION ─── */}
      <section className="relative gradient-hero text-white overflow-hidden">
        {/* Background Ambient Glows */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-150 w-150 rounded-full bg-white/2 blur-3xl" />
        </div>

        <div className="container-app relative py-16 sm:py-24 lg:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="space-y-6"
            >
              {/* Trust Badge Pill */}
              <motion.div custom={0} variants={fadeUp} className="inline-block">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-md">
                  <Sparkles className="h-4 w-4 text-accent animate-pulse" />
                  <span className="text-xs sm:text-sm font-medium text-white/90">
                    ✨ India&apos;s #1 Rated Home Services Platform
                  </span>
                </div>
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                custom={1}
                variants={fadeUp}
                className="font-heading text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
              >
                Expert Home Services
                <br />
                <span className="text-accent drop-shadow-sm">
                  At Your Doorstep
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                custom={2}
                variants={fadeUp}
                className="text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto font-body leading-relaxed"
              >
                Book top-rated, background-verified professionals for electrical, plumbing, AC servicing, cleaning, painting & more in under 60 seconds.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                custom={3}
                variants={fadeUp}
                className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <Button
                  variant="accent"
                  size="lg"
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                  className="w-full sm:w-auto px-8 py-3.5 text-base shadow-glow font-semibold"
                  asChild
                >
                  <Link to={ROUTES.SERVICES}>Book a Service Now</Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  leftIcon={<Phone className="h-5 w-5 text-accent" />}
                  className="w-full sm:w-auto border-white/25 text-white hover:bg-white/10 text-base py-3.5"
                  onClick={() => window.open(`tel:${APP_CONFIG.supportPhone}`)}
                >
                  24/7 Helpline: 1800-123-4567
                </Button>
              </motion.div>
            </motion.div>

            {/* Live Metrics Ribbon */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4 rounded-2xl border border-white/15 bg-white/10 p-4 sm:p-6 backdrop-blur-xl"
            >
              {[
                { icon: Users, value: "100,000+", label: "Happy Homes Served" },
                { icon: Star, value: "4.9 ★", label: "Average Service Rating" },
                { icon: Shield, value: "500+", label: "Verified Tradesmen" },
                { icon: Clock, value: "30 Mins", label: "Emergency Arrival" },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="text-center space-y-1">
                    <Icon className="mx-auto h-5 w-5 text-accent mb-1" />
                    <div className="font-heading text-xl sm:text-2xl font-bold text-white">
                      {stat.value}
                    </div>
                    <div className="text-[11px] sm:text-xs text-white/60">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>

        {/* Bottom Curved Wave Divider */}
        <div className="relative bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto block"
            preserveAspectRatio="none"
          >
            <path
              d="M0,32 C320,80 960,0 1440,48 L1440,80 L0,80 Z"
              fill="var(--color-background)"
            />
          </svg>
        </div>
      </section>

      {/* ─── 2. LIVE SEARCH BAR SECTION ─── */}
      <section className="-mt-8 relative z-20 container-app">
        <div className="mx-auto max-w-3xl">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearchSubmit}
            suggestions={searchSuggestions}
            onSelectSuggestion={(suggestion) => {
              navigate(`${ROUTES.SERVICES}?q=${encodeURIComponent(suggestion)}`);
            }}
            location={location}
            onLocationClick={() => {
              const newLoc = prompt("Enter your city or pincode:", location);
              if (newLoc) setLocation(newLoc);
            }}
            onFilterClick={() => navigate(ROUTES.SERVICES)}
            className="shadow-2xl"
          />
        </div>
      </section>

      {/* ─── 3. CATEGORIES GRID (15 CATEGORIES) ─── */}
      <section className="container-app py-16 sm:py-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="text-center mb-12"
        >
          <motion.div custom={0} variants={fadeUp}>
            <Badge variant="accent" className="mb-3 px-3 py-1">
              Explore Services
            </Badge>
          </motion.div>
          <motion.h2
            custom={1}
            variants={fadeUp}
            className="font-heading text-3xl font-bold text-primary sm:text-4xl"
          >
            What do you need help with today?
          </motion.h2>
          <motion.p
            custom={2}
            variants={fadeUp}
            className="mt-3 text-foreground-secondary max-w-2xl mx-auto text-sm sm:text-base"
          >
            Select from 15 specialized home service categories. Every job is backed by fixed pricing and our 30-day warranty.
          </motion.p>
        </motion.div>

        {/* 15 Categories Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={stagger}
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-4 lg:gap-5"
        >
          {SERVICE_CATEGORIES.map((category, i) => (
            <motion.div key={category.id} custom={i} variants={fadeUp}>
              <Link to={`${ROUTES.SERVICES}/${category.slug}`}>
                <Card
                  hover
                  className="group text-center p-5 h-full flex flex-col items-center justify-between border border-border/80 hover:border-accent transition-all duration-300 hover:shadow-card-hover"
                >
                  <div className="space-y-3 flex flex-col items-center">
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl transition-transform duration-300 group-hover:scale-110 shadow-xs"
                      style={{
                        backgroundColor: `${category.color}15`,
                      }}
                    >
                      {category.icon}
                    </div>
                    <div>
                      <h3 className="font-heading text-sm font-semibold text-primary group-hover:text-accent transition-colors">
                        {category.name}
                      </h3>
                      <p className="mt-1 text-[11px] text-foreground-muted line-clamp-2 leading-relaxed hidden sm:block">
                        {category.description}
                      </p>
                    </div>
                  </div>

                  <span className="mt-3 text-[10px] font-semibold text-foreground-muted bg-muted px-2 py-0.5 rounded-full group-hover:bg-accent/10 group-hover:text-accent transition-colors">
                    {category.count} services
                  </span>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ─── 4. POPULAR SERVICES SECTION ─── */}
      <section className="bg-surface py-16 sm:py-24 border-y border-border">
        <div className="container-app">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
            <div>
              <Badge variant="accent" className="mb-2">
                Most Booked
              </Badge>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-primary">
                Popular Services in Your Area
              </h2>
              <p className="text-xs sm:text-sm text-foreground-secondary mt-1">
                Highest rated services booked by homeowners this week
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              rightIcon={<ArrowRight className="h-4 w-4" />}
              asChild
            >
              <Link to={ROUTES.SERVICES}>Browse All Services</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {POPULAR_SERVICES.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                isAdded={Boolean(addedServices[service.id])}
                onAdd={handleToggleAddService}
                onRemove={handleToggleAddService}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── 5. EMERGENCY 24/7 SERVICES BANNER ─── */}
      <section className="container-app py-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-orange-600 text-white p-8 sm:p-12 shadow-2xl">
          {/* Background Ambient Circle */}
          <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
            {/* Left Info */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md">
                <Zap className="h-4 w-4 text-yellow-300 fill-yellow-300 animate-bounce" />
                24/7 Immediate Dispatch
              </div>

              <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Emergency Home Breakdown?
                <br />
                <span className="text-yellow-300">30-Minute Arrival Guaranteed!</span>
              </h2>

              <p className="text-sm sm:text-base text-white/90 max-w-xl leading-relaxed">
                Water pipe burst, sudden power outage, locked out of house, or gas smells? Our fast-response emergency mechanics are on standby 24/7.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  variant="accent"
                  size="lg"
                  className="bg-yellow-400 text-primary hover:bg-yellow-300 font-bold shadow-lg text-sm sm:text-base"
                  onClick={() => window.open(`tel:${APP_CONFIG.supportPhone}`)}
                  leftIcon={<Phone className="h-5 w-5 fill-primary" />}
                >
                  Call Emergency Hotline
                </Button>
              </div>
            </div>

            {/* Right Emergency Grid Tiles */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-3">
              {EMERGENCY_SERVICES.map((emg) => (
                <div
                  key={emg.id}
                  className="rounded-2xl bg-white/15 p-4 backdrop-blur-md border border-white/20 space-y-2 text-left"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{emg.icon}</span>
                    <span className="text-[10px] font-bold text-yellow-300 bg-black/30 px-2 py-0.5 rounded-full">
                      {emg.arrival}
                    </span>
                  </div>
                  <h4 className="font-heading text-xs font-bold text-white line-clamp-2">
                    {emg.title}
                  </h4>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. WHY HOME-E-FIX (4 PILLARS) ─── */}
      <section className="bg-surface py-16 sm:py-24 border-y border-border">
        <div className="container-app text-center">
          <Badge variant="accent" className="mb-3">
            Why Choose Us
          </Badge>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-primary">
            The Home-e-Fix Standard
          </h2>
          <p className="mt-3 text-sm sm:text-base text-foreground-secondary max-w-2xl mx-auto">
            We built Home-e-Fix to remove stress, unreliability, and hidden costs from home repairs.
          </p>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_HOMEEFIX.map((pillar) => (
              <Card
                key={pillar.id}
                hover
                className="p-6 text-center space-y-4 border border-border/80"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 text-3xl">
                  {pillar.icon}
                </div>
                <h3 className="font-heading text-base font-semibold text-primary">
                  {pillar.title}
                </h3>
                <p className="text-xs text-foreground-secondary leading-relaxed">
                  {pillar.description}
                </p>
                <Badge variant="secondary" className="text-[10px] font-bold text-accent">
                  {pillar.highlight}
                </Badge>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 7. HOW IT WORKS ─── */}
      <section className="container-app py-16 sm:py-24">
        <div className="text-center mb-14">
          <Badge variant="accent" className="mb-3">
            Simple Process
          </Badge>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-primary">
            How Home-e-Fix Works
          </h2>
          <p className="mt-3 text-sm sm:text-base text-foreground-secondary">
            Book professional service in 4 simple steps
          </p>
        </div>

        <div className="relative grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              step: "01",
              title: "Select Service",
              desc: "Choose from 100+ services with fixed upfront prices.",
            },
            {
              step: "02",
              title: "Pick Date & Slot",
              desc: "Select your preferred date, time slot, and home address.",
            },
            {
              step: "03",
              title: "Verified Pro Arrives",
              desc: "Track your assigned professional arriving on time with tools.",
            },
            {
              step: "04",
              title: "Pay After Job",
              desc: "Inspect the completed job and pay securely via cash/UPI.",
            },
          ].map((item, idx) => (
            <div key={item.step} className="relative text-center p-6 rounded-2xl bg-surface border border-border shadow-xs">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-white font-heading font-extrabold text-base shadow-glow">
                {item.step}
              </div>
              <h3 className="font-heading text-base font-semibold text-primary mb-1">
                {item.title}
              </h3>
              <p className="text-xs text-foreground-secondary leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 8. HOME-E-FIX PROMISE ─── */}
      <section className="bg-primary text-white py-16 sm:py-20">
        <div className="container-app">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/20 px-3 py-1 text-xs font-bold text-accent mb-3">
              <Shield className="h-4 w-4" />
              100% Peace of Mind
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-white">
              The Home-e-Fix Guarantee
            </h2>
            <p className="mt-3 text-sm sm:text-base text-white/70">
              We stand behind every repair and installation with uncompromising quality standards.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {HOMEEFIX_PROMISE.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-md space-y-3"
              >
                <div className="text-3xl mb-2">{item.icon}</div>
                <h3 className="font-heading text-base font-semibold text-white">
                  {item.title}
                </h3>
                <p className="text-xs text-white/70 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 9. MEMBERSHIP SHOWCASE ─── */}
      <section className="container-app py-16 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <MembershipCard
            onSubscribe={() => alert("VIP Pass Subscription flow initiated!")}
          />
        </div>
      </section>

      {/* ─── 10. TESTIMONIALS ─── */}
      <section className="bg-surface py-16 sm:py-24 border-y border-border">
        <div className="container-app">
          <div className="text-center mb-12">
            <Badge variant="accent" className="mb-3">
              Customer Reviews
            </Badge>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-primary">
              Loved by 100,000+ Homeowners
            </h2>
            <p className="mt-3 text-sm text-foreground-secondary">
              Real feedback from verified homeowners across India
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t, idx) => (
              <ReviewCard
                key={idx}
                userName={t.userName}
                userAvatar={t.userAvatar}
                rating={t.rating}
                date={t.date}
                comment={t.comment}
                serviceName={t.serviceName}
                isVerified={t.isVerified}
                helpfulCount={t.helpfulCount}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── 11. BLOG & TIPS ─── */}
      <section className="container-app py-16 sm:py-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <Badge variant="accent" className="mb-2">
              Home Care Guide
            </Badge>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-primary">
              Expert Maintenance Tips & Articles
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {BLOG_ARTICLES.map((article) => (
            <Card key={article.id} hover className="overflow-hidden flex flex-col h-full">
              <div className="aspect-video w-full overflow-hidden bg-muted">
                <img
                  src={article.image}
                  alt={article.title}
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-foreground-muted">
                    <span className="font-semibold text-accent">{article.category}</span>
                    <span>{article.readTime}</span>
                  </div>
                  <h3 className="font-heading text-base font-semibold text-primary line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-xs text-foreground-secondary line-clamp-2">
                    {article.snippet}
                  </p>
                </div>
                <div className="pt-2 text-xs font-semibold text-accent flex items-center gap-1 cursor-pointer hover:underline">
                  Read Article <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ─── 12. FAQ ACCORDION ─── */}
      <section className="bg-surface py-16 sm:py-24 border-t border-border">
        <div className="container-app">
          <div className="mx-auto max-w-3xl">
            <div className="text-center mb-12">
              <Badge variant="accent" className="mb-3">
                Got Questions?
              </Badge>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-primary">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-3">
              {HOMEPAGE_FAQS.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;

                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-border bg-background overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="flex w-full items-center justify-between p-5 text-left font-heading text-sm sm:text-base font-semibold text-primary hover:text-accent transition-colors cursor-pointer"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        className={cn(
                          "h-5 w-5 text-foreground-muted transition-transform duration-200 shrink-0 ml-4",
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
                          transition={{ duration: 0.2 }}
                        >
                          <div className="px-5 pb-5 text-xs sm:text-sm text-foreground-secondary leading-relaxed border-t border-border/40 pt-3">
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
        </div>
      </section>

      {/* ─── 13. MOBILE APP DOWNLOAD CTA ─── */}
      <section className="container-app py-16">
        <div className="rounded-3xl gradient-hero text-white p-8 sm:p-12 relative overflow-hidden">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:items-center">
            <div className="md:col-span-7 space-y-4">
              <Badge variant="accent">Mobile App</Badge>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white">
                Book Services Faster on the Home-e-Fix App
              </h2>
              <p className="text-sm text-white/80 max-w-md">
                Get real-time pro tracking, exclusive app-only coupons, and instant 1-tap booking on iOS and Android.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Button
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 gap-2"
                >
                  <Smartphone className="h-5 w-5 text-accent" />
                  Google Play Store
                </Button>
                <Button
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 gap-2"
                >
                  <Smartphone className="h-5 w-5 text-accent" />
                  Apple App Store
                </Button>
              </div>
            </div>

            <div className="md:col-span-5 flex items-center justify-center">
              <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-md border border-white/20 text-center space-y-3">
                <QrCode className="mx-auto h-28 w-28 text-white" />
                <p className="text-xs text-white/70">Scan QR Code to Install App</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
