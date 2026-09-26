import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router";
import {
  Search,
  Sparkles,
  ArrowRight,
  Shield,
  MapPin,
  X,
  ChevronDown,
  Layers,
  Zap,
  Droplets,
  Wind,
  Hammer,
  Paintbrush,
  Tv,
  Camera,
  Utensils,
  Maximize,
  Grid,
  Home as HomeIcon,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ServiceCard } from "@/components/ui/service-card";
import { useCartStore } from "@/store/cart.store";
import { useLocationStore, formatLocationLabel } from "@/store/location.store";
import { serviceAreaService } from "@/services/location/serviceAreaService";
import { MobileLocationSheet } from "@/components/shared/MobileLocationSheet";
import { ROUTES } from "@/constants/routes";
import {
  SERVICE_CATEGORIES,
  CATEGORY_SERVICES_MAP,
} from "@/constants/services";
import { cn } from "@/lib/utils";
import { HomeEFixCharacter } from "@/components/character/HomeEFixCharacter";

/* ─── Consistent Semantically Accurate Category Icons ─── */
const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  electrical: Zap,
  plumbing: Droplets,
  ac: Wind,
  cleaning: Sparkles,
  carpentry: Hammer,
  painting: Paintbrush,
  appliances: Tv,
  security: Camera,
  "pest-control": Shield,
  civil: Hammer,
  "false-ceiling": Grid,
  flooring: Layers,
  glass: Maximize,
  "modular-kitchen": Utensils,
  "smart-home": HomeIcon,
};

const PAGE_SIZE = 16;

export default function ServiceCatalog() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state synchronization
  const initialCategory = searchParams.get("category") || "all";
  const initialQuery = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [sortBy, setSortBy] = useState<string>("popular");
  const [priceFilter, setPriceFilter] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);
  const [availabilityView, setAvailabilityView] = useState<"available" | "all">("all");

  const { items, addItem, removeItem } = useCartStore();
  const { locality, city, pincode, currentLocation } = useLocationStore();

  const isLocationConfirmed = currentLocation.confirmed || Boolean(locality || pincode);
  const locationLabel = formatLocationLabel({ locality, city });

  // Debounce search input by 250ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Sync category changes with URL search params
  const handleSelectCategory = (catSlug: string) => {
    setSelectedCategory(catSlug);
    setVisibleCount(PAGE_SIZE);
    const newParams = new URLSearchParams(searchParams);
    if (catSlug === "all") {
      newParams.delete("category");
    } else {
      newParams.set("category", catSlug);
    }
    setSearchParams(newParams, { replace: true });
  };

  // Compile full master service list with category metadata
  const allServicesList = useMemo(() => {
    return Object.entries(CATEGORY_SERVICES_MAP).flatMap(([catSlug, list]) => {
      const parentCat = SERVICE_CATEGORIES.find((c) => c.slug === catSlug);
      return list.map((svc: any) => ({
        ...svc,
        categorySlug: svc.category?.slug || catSlug,
        categoryName: svc.category?.name || parentCat?.name || "Service",
      }));
    });
  }, []);

  // Calculate real service count per category dynamically from database/catalog
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allServicesList.forEach((s) => {
      const slug = s.categorySlug;
      counts[slug] = (counts[slug] || 0) + 1;
    });
    return counts;
  }, [allServicesList]);

  // Check location serviceability
  const serviceability = useMemo(() => {
    if (!isLocationConfirmed) return null;
    return serviceAreaService.validateServiceArea({
      locality,
      city,
      pincode,
    });
  }, [isLocationConfirmed, locality, city, pincode]);

  const isServiceableInLocation = serviceability ? serviceability.isServiceable : false;

  // Real count of services available in confirmed location
  const availableServicesCount = useMemo(() => {
    if (!isLocationConfirmed || !isServiceableInLocation) return 0;
    return allServicesList.length;
  }, [isLocationConfirmed, isServiceableInLocation, allServicesList.length]);

  // Filter services by search query, category, price, and availability
  const filteredServices = useMemo(() => {
    return allServicesList.filter((service) => {
      // 1. Search Query Match
      if (debouncedQuery) {
        const q = debouncedQuery.toLowerCase();
        const matchesName = service.name.toLowerCase().includes(q);
        const matchesDesc = (service.shortDescription || "").toLowerCase().includes(q);
        const matchesCat = (service.categoryName || "").toLowerCase().includes(q);
        const matchesSub = (service.subCategory || "").toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCat && !matchesSub) {
          return false;
        }
      }

      // 2. Category Filter
      if (selectedCategory !== "all" && service.categorySlug !== selectedCategory) {
        return false;
      }

      // 3. Price Filter
      const price = service.discountedPrice || service.basePrice || 0;
      if (priceFilter === "under-199" && price > 199) return false;
      if (priceFilter === "199-499" && (price < 199 || price > 499)) return false;
      if (priceFilter === "499-plus" && price <= 499) return false;

      // 4. Availability Filter
      if (availabilityView === "available") {
        if (!isLocationConfirmed || !isServiceableInLocation) {
          return false;
        }
      }

      return true;
    });
  }, [
    allServicesList,
    debouncedQuery,
    selectedCategory,
    priceFilter,
    availabilityView,
    isLocationConfirmed,
    isServiceableInLocation,
  ]);

  // Sorted services
  const sortedServices = useMemo(() => {
    return [...filteredServices].sort((a, b) => {
      const priceA = a.discountedPrice || a.basePrice || 0;
      const priceB = b.discountedPrice || b.basePrice || 0;
      if (sortBy === "price-low") return priceA - priceB;
      if (sortBy === "price-high") return priceB - priceA;
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      if (sortBy === "duration") return (a.duration || 30) - (b.duration || 30);
      // Default: Popular
      if (a.isPopular && !b.isPopular) return -1;
      if (!a.isPopular && b.isPopular) return 1;
      return 0;
    });
  }, [filteredServices, sortBy]);

  // Paginated visible slice
  const visibleServices = useMemo(() => {
    return sortedServices.slice(0, visibleCount);
  }, [sortedServices, visibleCount]);

  const handleToggleAdd = (service: any) => {
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

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 font-sans selection:bg-[#FF6A00]/20 selection:text-[#FF6A00]">
      {/* ─────────────────────────────────────────────────────────────
          1. CATALOGUE HERO BANNER (Clear Hierarchy & Search)
         ───────────────────────────────────────────────────────────── */}
      <section className="relative bg-primary text-white py-12 sm:py-16 lg:py-20 overflow-hidden border-b border-white/10">
        {/* Subtle Ambient Glows */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(6,182,212,0.15),transparent)] pointer-events-none" />
        <div className="absolute top-1/4 -left-32 w-80 h-80 rounded-full bg-[#FF6A00]/10 blur-3xl pointer-events-none" />

        <div className="container-app relative z-10">
          <div className="mx-auto max-w-3xl text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-xs font-bold tracking-wider uppercase text-cyan-300">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF6A00]" />
              <span>{SERVICE_CATEGORIES.length} Categories • {allServicesList.length} Verified Services</span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Home Service Catalogue
            </h1>

            <p className="text-sm sm:text-base text-slate-200 max-w-xl mx-auto leading-relaxed">
              Find the right service for your home. Transparent rates, verified trade specialists, and guaranteed appointments.
            </p>

            {/* Live Search Input */}
            <div className="pt-4 max-w-2xl mx-auto">
              <div className="relative flex items-center shadow-2xl rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus-within:border-[#FF6A00] transition-all">
                <Search className="h-5 w-5 text-slate-400 ml-4 shrink-0" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search electrical, tap repair, split AC, cleaning..."
                  className="h-13 sm:h-14 border-0 bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0 px-3"
                  aria-label="Search home services"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setDebouncedQuery("");
                    }}
                    className="p-2 mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    aria-label="Clear search query"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. LOCATION DEPENDENCY BANNER (Location-Aware Catalogue)
         ───────────────────────────────────────────────────────────── */}
      <section className="container-app relative -mt-6 z-20">
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-orange-500/10 text-[#FF6A00] flex items-center justify-center shrink-0">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF6A00]">
                  Service Territory
                </span>
                {isLocationConfirmed && isServiceableInLocation && (
                  <Badge variant="success" className="text-[10px] py-0 px-1.5 font-bold">
                    ✓ Verified Coverage
                  </Badge>
                )}
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                {isLocationConfirmed
                  ? `Service coverage for ${locationLabel}`
                  : "Select your location to see services available near you."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              type="button"
              variant={isLocationConfirmed ? "outline" : "accent"}
              size="sm"
              onClick={() => setShowLocationModal(true)}
              className={cn(
                "rounded-xl text-xs font-bold cursor-pointer h-10 px-4",
                !isLocationConfirmed && "bg-[#FF6A00] hover:bg-[#E55F00] text-white shadow-md shadow-orange-500/20"
              )}
            >
              <MapPin className="w-3.5 h-3.5 mr-1.5" />
              <span>{isLocationConfirmed ? "Change Location" : "Select Location"}</span>
            </Button>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. ALL SERVICE CATEGORIES (Spacious, Distinct & Accessible)
         ───────────────────────────────────────────────────────────── */}
      <section className="container-app py-12 sm:py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/10 text-[#FF6A00] text-xs font-bold uppercase tracking-wider mb-1">
              <span>Directory</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-primary dark:text-white">
              All Service Categories
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Select a category to view specialized mechanics and services
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={selectedCategory === "all" ? "accent" : "outline"}
              size="sm"
              onClick={() => handleSelectCategory("all")}
              className="text-xs font-bold rounded-xl cursor-pointer"
            >
              All Categories ({allServicesList.length})
            </Button>
          </div>
        </div>

        {/* Categories Grid: Spacious Cards with Consistent Icons & Real Service Counts */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-5">
          {SERVICE_CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICON_MAP[cat.slug] || Wrench;
            const count = categoryCounts[cat.slug] || 0;
            const isSelected = selectedCategory === cat.slug;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleSelectCategory(cat.slug)}
                className={cn(
                  "group p-4 sm:p-5 rounded-2xl border text-left flex flex-col justify-between transition-all duration-200 cursor-pointer relative",
                  isSelected
                    ? "border-[#FF6A00] bg-orange-500/5 dark:bg-orange-500/10 ring-2 ring-orange-500/30 shadow-md"
                    : "border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-[#FF6A00] hover:shadow-md hover:-translate-y-0.5"
                )}
              >
                <div className="space-y-3">
                  <div
                    className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105 shadow-xs"
                    style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                  >
                    <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                  </div>

                  <div>
                    <h3 className="font-heading text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-[#FF6A00] transition-colors leading-tight">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                      {cat.description}
                    </p>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#FF6A00] text-[11px]">
                    Starts ₹{cat.startingPrice}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                    {count} Services
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. AVAILABLE SERVICES (Filters, Search Results & Service Grid)
         ───────────────────────────────────────────────────────────── */}
      <section className="container-app py-8 sm:py-12 border-t border-slate-200/80 dark:border-slate-800">
        {/* Section Header with Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF6A00]">
                {selectedCategory === "all" ? "Catalogue" : `${SERVICE_CATEGORIES.find((c) => c.slug === selectedCategory)?.name || "Category"}`}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-500">
                {sortedServices.length} {sortedServices.length === 1 ? "Service" : "Services"}
              </span>
              {selectedCategory !== "all" && (
                <>
                  <span className="text-xs text-slate-400">•</span>
                  <Link
                    to={`/services/${selectedCategory}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#FF6A00] hover:underline"
                  >
                    <span>View Category Page</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </>
              )}
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-primary dark:text-white mt-1">
              Available Services
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              {isLocationConfirmed && isServiceableInLocation
                ? `Services available at ${locationLabel}.`
                : isLocationConfirmed
                ? `Location set to ${locationLabel} (Out of primary coverage).`
                : "Select your location to see services available near you."}
            </p>

            {/* Scope Switcher: Available Services vs All Services */}
            <div className="flex items-center gap-2 mt-3.5">
              <button
                type="button"
                onClick={() => setAvailabilityView("available")}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                  availabilityView === "available"
                    ? "bg-primary text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary"
                )}
              >
                Available Services {isLocationConfirmed && isServiceableInLocation ? `(${availableServicesCount})` : ""}
              </button>
              <button
                type="button"
                onClick={() => setAvailabilityView("all")}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                  availabilityView === "all"
                    ? "bg-primary text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary"
                )}
              >
                All Services ({allServicesList.length})
              </button>
            </div>
          </div>

          {/* Filtering and Sorting Bar */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* Quick Price Range Filter */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold">
              {[
                { id: "all", label: "All Prices" },
                { id: "under-199", label: "< ₹199" },
                { id: "199-499", label: "₹199–₹499" },
                { id: "499-plus", label: "₹499+" },
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setPriceFilter(pill.id)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-[11px]",
                    priceFilter === pill.id
                      ? "bg-white dark:bg-slate-700 text-[#FF6A00] font-bold shadow-2xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
                  )}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs">
              <span className="text-slate-400 font-medium">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-slate-800 dark:text-slate-200 font-bold focus:outline-none cursor-pointer text-xs"
              >
                <option value="popular" className="bg-slate-900 text-white">Recommended</option>
                <option value="price-low" className="bg-slate-900 text-white">Price: Low to High</option>
                <option value="price-high" className="bg-slate-900 text-white">Price: High to Low</option>
                <option value="duration" className="bg-slate-900 text-white">Fastest Duration</option>
              </select>
            </div>
          </div>
        </div>

        {/* Empty States */}
        {sortedServices.length === 0 ? (
          <div className="text-center py-16 px-4 space-y-4 max-w-lg mx-auto bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-slate-200/80 dark:border-slate-800">
            <HomeEFixCharacter state="searching" size={130} className="mx-auto" title="Service Catalog search state" />

            {!isLocationConfirmed && availabilityView === "available" ? (
              <div className="space-y-3">
                <h3 className="font-heading text-lg font-bold text-primary dark:text-white">
                  Select your location to see services available near you.
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Please confirm your locality or pin code to verify live trade availability and schedule booking slots.
                </p>
                <div className="pt-2">
                  <Button
                    variant="accent"
                    size="sm"
                    onClick={() => setShowLocationModal(true)}
                    className="font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Select Location
                  </Button>
                </div>
              </div>
            ) : isLocationConfirmed && !isServiceableInLocation && availabilityView === "available" ? (
              <div className="space-y-3">
                <h3 className="font-heading text-lg font-bold text-primary dark:text-white">
                  No services available here yet.
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  We are actively expanding across Greater Kolkata. Try another location or explore our complete catalog.
                </p>
                <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowLocationModal(true)}
                    className="font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Change Location
                  </Button>
                  <Button
                    variant="accent"
                    size="sm"
                    onClick={() => setAvailabilityView("all")}
                    className="font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Explore All Services
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="font-heading text-lg font-bold text-primary dark:text-white">
                  No services found
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  We couldn&apos;t find any active service matching &ldquo;{searchQuery || selectedCategory}&rdquo;. Try another keyword or clear your filters.
                </p>
                <div className="pt-2 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("");
                      setDebouncedQuery("");
                      setSelectedCategory("all");
                      setPriceFilter("all");
                      setAvailabilityView("all");
                      handleSelectCategory("all");
                    }}
                    className="font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Clear All Filters
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Service Cards Grid (4 Columns Desktop, 3 Columns Laptop, 2 Columns Tablet, 1 Mobile) */
          <div className="space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6">
              {visibleServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  isAdded={items.some((i) => i.id === service.id)}
                  onAdd={handleToggleAdd}
                  onRemove={handleToggleAdd}
                  onBookNow={handleDirectBook}
                />
              ))}
            </div>

            {/* Pagination / Progressive Loading */}
            {sortedServices.length > visibleCount && (
              <div className="text-center pt-4">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                  className="font-bold text-xs sm:text-sm px-8 py-3 rounded-xl border-slate-300 dark:border-slate-700 hover:border-[#FF6A00] transition-colors"
                >
                  <span>Show More Services ({sortedServices.length - visibleCount} remaining)</span>
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. LOCATION SELECTION MODAL
         ───────────────────────────────────────────────────────────── */}
      <MobileLocationSheet
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
      />
    </div>
  );
}
