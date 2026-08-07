import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Sparkles,
  ArrowRight,
  Clock,
  Shield,
  Star,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SearchBar } from "@/components/ui/search-bar";
import { ServiceCard } from "@/components/ui/service-card";
import { FilterPanel } from "@/components/ui/filters";
import { useCartStore } from "@/store/cart.store";
import { ROUTES } from "@/constants/routes";
import {
  SERVICE_CATEGORIES,
  POPULAR_SERVICES,
  CATEGORY_SERVICES_MAP,
} from "@/constants/services";
import { formatCurrency } from "@/lib/utils";

export default function ServiceCatalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("popular");
  const { items, addItem, removeItem } = useCartStore();

  const handleToggleAdd = (service: any) => {
    const isAlreadyAdded = items.some((i) => i.id === service.id);
    if (isAlreadyAdded) {
      removeItem(service.id);
    } else {
      addItem(service);
    }
  };

  // Combine services from all categories into one master list
  const allServicesList = Object.values(CATEGORY_SERVICES_MAP).flat();

  // Filtered services
  const filteredServices = allServicesList.filter((service) => {
    const matchesQuery =
      !searchQuery ||
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || service.category?.slug === selectedCategory;

    return matchesQuery && matchesCategory;
  });

  // Sorted services
  const sortedServices = [...filteredServices].sort((a, b) => {
    const priceA = a.discountedPrice || a.basePrice;
    const priceB = b.discountedPrice || b.basePrice;
    if (sortBy === "price-low") return priceA - priceB;
    if (sortBy === "price-high") return priceB - priceA;
    if (sortBy === "rating") return (b.rating || 4.8) - (a.rating || 4.8);
    return 0; // Default popular
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* ─── CATALOG HERO BANNER ─── */}
      <section className="relative gradient-hero text-white py-14 sm:py-20">
        <div className="container-app">
          <div className="mx-auto max-w-3xl text-center space-y-4">
            <Badge variant="accent" className="px-3 py-1 text-xs">
              ✨ 15 Categories & 100+ Services
            </Badge>
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-white">
              Home Service Catalogue
            </h1>
            <p className="text-sm sm:text-base text-white/80 max-w-xl mx-auto">
              Explore verified professionals with upfront fixed pricing, 30-day warranty, and guaranteed 30-min arrival.
            </p>
          </div>
        </div>
      </section>

      {/* ─── LIVE SEARCH BAR ─── */}
      <section className="-mt-7 container-app max-w-3xl relative z-20">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={(q) => setSearchParams({ q })}
          placeholder="Search plumbing, AC foam wash, electrician..."
          className="shadow-xl"
        />
      </section>

      {/* ─── 15 CATEGORIES HORIZONTAL / GRID SELECTOR ─── */}
      <section className="container-app py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-primary">
              All Service Categories
            </h2>
            <p className="text-xs sm:text-sm text-foreground-secondary">
              Select a category to view specialized mechanics and services
            </p>
          </div>

          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className="text-xs font-semibold text-accent hover:underline cursor-pointer"
          >
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
          {SERVICE_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.slug;

            return (
              <Link
                key={cat.id}
                to={`${ROUTES.SERVICES}/${cat.slug}`}
                className="group"
              >
                <Card
                  hover
                  className={`p-4 text-center h-full flex flex-col items-center justify-between border transition-all duration-200 ${
                    isSelected
                      ? "border-accent bg-accent/5 ring-2 ring-accent/30"
                      : "border-border/80 hover:border-accent"
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div
                      className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl transition-transform duration-200 group-hover:scale-110 shadow-xs"
                      style={{ backgroundColor: `${cat.color}15` }}
                    >
                      {cat.icon}
                    </div>
                    <div>
                      <h3 className="font-heading text-xs font-bold text-primary group-hover:text-accent transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-[10px] text-foreground-muted mt-0.5">
                        Starts {formatCurrency(cat.startingPrice)}
                      </p>
                    </div>
                  </div>

                  <span className="mt-3 text-[10px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                    {cat.count} Services
                  </span>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ─── FILTER & SERVICES SECTION ─── */}
      <section className="container-app py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-border mb-8">
          <div>
            <h3 className="font-heading text-lg font-bold text-primary">
              Available Services ({sortedServices.length})
            </h3>
            <p className="text-xs text-foreground-secondary">
              Showing verified services matching your criteria
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-foreground-muted font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-primary font-medium focus:outline-hidden focus:ring-2 focus:ring-accent cursor-pointer"
            >
              <option value="popular">Most Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {sortedServices.length === 0 ? (
          <div className="text-center py-16 space-y-3 bg-surface rounded-2xl border border-border">
            <Search className="mx-auto h-10 w-10 text-foreground-muted" />
            <h4 className="font-heading text-base font-semibold text-primary">
              No services found
            </h4>
            <p className="text-xs text-foreground-secondary max-w-sm mx-auto">
              We couldn&apos;t find any service matching &quot;{searchQuery}&quot;. Try searching for plumbing, AC, or electrical.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
            >
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                isAdded={items.some((i) => i.id === service.id)}
                onAdd={handleToggleAdd}
                onRemove={handleToggleAdd}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
