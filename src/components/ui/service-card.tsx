import { Link } from "react-router";
import { motion } from "framer-motion";
import { Clock, Plus, Check, Shield, ArrowUpRight } from "lucide-react";
import { cn, formatCurrency, formatDuration } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Rating } from "@/components/ui/rating";

export interface ServiceCardProps {
  service: any;
  isAdded?: boolean;
  onAdd?: (service: any) => void;
  onRemove?: (service: any) => void;
  onBookNow?: (service: any) => void;
  variant?: "grid" | "horizontal";
  className?: string;
}

const CATEGORY_IMAGE_FALLBACKS: Record<string, string> = {
  electrical: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&q=80",
  plumbing: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&q=80",
  ac: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=80",
  carpentry: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&q=80",
  cleaning: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80",
  painting: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&q=80",
  civil: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80",
  inspection: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80",
  security: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&q=80",
  glass: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&q=80",
  "smart-home": "https://images.unsplash.com/photo-1558002038-1055907df827?w=600&q=80",
  "pest-control": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&q=80",
  appliances: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&q=80",
  "modular-kitchen": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&q=80",
  flooring: "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=600&q=80",
  "false-ceiling": "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&q=80",
  "interior-repair": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&q=80",
};

export function ServiceCard({
  service,
  isAdded = false,
  onAdd,
  onRemove,
  onBookNow,
  variant = "grid",
  className,
}: ServiceCardProps) {
  const {
    name = "Service Item",
    slug = "",
    shortDescription = "High quality professional service for your home.",
    basePrice = 499,
    discountedPrice,
    duration = 60,
    rating = 4.8,
    reviewCount = 120,
    isPopular = false,
    pricingLabel,
    pricingDetails,
    warranty,
    thumbnail,
    category,
  } = service;

  const categorySlug = category?.slug || "general";
  const hasDiscount = discountedPrice && discountedPrice < basePrice;
  const effectivePrice = discountedPrice || basePrice;

  const displayImage =
    thumbnail ||
    CATEGORY_IMAGE_FALLBACKS[categorySlug] ||
    category?.bannerImage ||
    "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&q=80";

  // Subtitle explaining pricing structure (labour vs spares)
  const resolvedPricingDetails =
    pricingDetails ||
    (discountedPrice ? "Standard labour included • Parts extra at MRP" : "Complete fixed-rate service");

  if (variant === "horizontal") {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <Card hover className={cn("overflow-hidden p-4.5 interactive-card border-border/80 hover:border-accent/50", className)}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <img
                src={displayImage}
                alt={name}
                onError={(e) => {
                  const target = e.currentTarget;
                  const fallback = CATEGORY_IMAGE_FALLBACKS[categorySlug] || "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&q=80";
                  if (target.src !== fallback) {
                    target.src = fallback;
                  }
                }}
                className="h-20 w-20 rounded-2xl object-cover shrink-0"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    to={`/services/${categorySlug}/${slug}`}
                    className="font-heading text-base font-bold text-primary hover:text-accent transition-colors"
                  >
                    {name}
                  </Link>
                  {isPopular && <Badge variant="accent" className="text-[10px]">Popular</Badge>}
                </div>

                <div className="flex items-center gap-3 text-xs text-foreground-muted">
                  <Rating value={rating} reviewCount={reviewCount} size="sm" />
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-accent" />
                    {formatDuration(duration)}
                  </span>
                </div>

                <p className="text-xs text-foreground-muted line-clamp-1">
                  {resolvedPricingDetails}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
              <div className="text-left sm:text-right">
                <div className="font-heading text-xl font-extrabold text-primary">
                  {pricingLabel || formatCurrency(effectivePrice)}
                </div>
                {hasDiscount && (
                  <div className="text-xs text-foreground-muted line-through">
                    {formatCurrency(basePrice)}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={isAdded ? "outline" : "accent"}
                  onClick={() => (isAdded ? onRemove?.(service) : onAdd?.(service))}
                  leftIcon={isAdded ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  className={cn("font-bold", !isAdded && "hover:shadow-glow transition-all")}
                >
                  {isAdded ? "Added" : "Book Now"}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  // Enhanced Default Grid Variant (Spacious, Clear Hierarchy)
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="h-full"
    >
      <Card hover className={cn("overflow-hidden flex flex-col h-full interactive-card border-border/80 hover:border-accent/60 group rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300", className)}>
        {/* Thumbnail Header */}
        <div className="relative aspect-16/10 w-full bg-muted overflow-hidden">
          <img
            src={displayImage}
            alt={name}
            onError={(e) => {
              const target = e.currentTarget;
              const fallback = CATEGORY_IMAGE_FALLBACKS[categorySlug] || "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&q=80";
              if (target.src !== fallback) {
                target.src = fallback;
              }
            }}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Badges Overlay */}
          <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
            {isPopular ? (
              <Badge variant="accent" className="shadow-md text-xs font-bold px-2.5 py-0.5 pointer-events-auto">
                Popular Choice
              </Badge>
            ) : <div />}

            {warranty && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-black/60 text-white backdrop-blur-md px-2.5 py-0.5 rounded-full shadow-xs pointer-events-auto">
                <Shield className="w-3 h-3 text-[#FF6A00]" />
                {warranty.split(" ")[0]} Cover
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-2.5">
            {/* Rating & Duration */}
            <div className="flex items-center justify-between text-xs">
              <Rating value={rating} reviewCount={reviewCount} size="sm" />
              <span className="flex items-center gap-1 font-medium text-slate-500 dark:text-slate-400">
                <Clock className="h-3.5 w-3.5 text-[#FF6A00]" />
                {formatDuration(duration)}
              </span>
            </div>

            {/* Service Title */}
            <Link
              to={`/services/${categorySlug}/${slug}`}
              className="font-heading text-lg font-bold text-primary group-hover:text-accent transition-colors block line-clamp-1 leading-snug"
            >
              {name}
            </Link>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
              {shortDescription}
            </p>

            {/* Pricing Transparency Detail */}
            <div className="pt-1 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="truncate">{resolvedPricingDetails}</span>
            </div>
          </div>

          {/* Price & Action Block */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                {pricingLabel ? "Transparent Pricing" : "Service Rate"}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-heading text-xl font-extrabold text-primary dark:text-white">
                  {pricingLabel || formatCurrency(effectivePrice)}
                </span>
                {hasDiscount && (
                  <span className="text-xs text-slate-400 line-through">
                    {formatCurrency(basePrice)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to={`/services/${categorySlug}/${slug}`}
                className="hidden sm:inline-flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="View details"
              >
                <ArrowUpRight className="w-4 h-4" />
              </Link>

              <Button
                size="sm"
                variant={isAdded ? "outline" : "accent"}
                onClick={() => {
                  if (isAdded) {
                    onRemove?.(service);
                  } else {
                    onBookNow ? onBookNow(service) : onAdd?.(service);
                  }
                }}
                leftIcon={isAdded ? <Check className="h-4 w-4 text-emerald-600" /> : <Plus className="h-4 w-4" />}
                className={cn(
                  "font-bold px-4 py-2 rounded-xl text-xs sm:text-sm cursor-pointer",
                  !isAdded && "shadow-md shadow-orange-500/20 hover:shadow-orange-500/30 transition-all active:scale-95"
                )}
              >
                {isAdded ? "Added" : "Book Now"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
