import { Link } from "react-router";
import { motion } from "framer-motion";
import { Clock, Plus, Check, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rating } from "@/components/ui/rating";
import { getServiceImage } from "@/constants/serviceImageMap";
import {
  resolveServicePrice,
  formatServiceDuration,
  formatCompactWarranty,
} from "@/utils/servicePricing";

export interface ServiceCardProps {
  service: any;
  isAdded?: boolean;
  onAdd?: (service: any) => void;
  onRemove?: (service: any) => void;
  onBookNow?: (service: any) => void;
  variant?: "grid" | "horizontal";
  className?: string;
}

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
    rating,
    reviewCount = 0,
    isPopular = false,
    is_featured = false,
    is_new = false,
    isNew = false,
    category,
    categoryName: explicitCategoryName,
    subCategory,
    sparesPolicy,
    requires_materials,
    requiresMaterials: serviceRequiresMaterials,
  } = service || {};

  const requiresMaterials = Boolean(
    requires_materials ||
    serviceRequiresMaterials ||
    service?.requiresParts ||
    (sparesPolicy && sparesPolicy.toLowerCase().includes("extra"))
  );

  const categorySlug = category?.slug || service?.categorySlug || "electrical";
  const categoryName = explicitCategoryName || category?.name || subCategory || "Service";

  // Central Image Resolution (Section 5)
  const imageInfo = getServiceImage(service);

  // Pricing Engine & Format Resolution (Sections 15-23)
  const priceView = resolveServicePrice(service);

  // Duration Formatting (Section 14)
  const durationText = formatServiceDuration(service);

  // Genuine Badges (Sections 6-10)
  const showPopular = Boolean(isPopular || is_featured);
  const showNew = Boolean(is_new || isNew);
  const compactWarranty = formatCompactWarranty(service);

  const handleActionClick = () => {
    if (isAdded) {
      onRemove?.(service);
    } else if (onBookNow) {
      onBookNow(service);
    } else {
      onAdd?.(service);
    }
  };

  /* ─────────────────────────────────────────────────────────────
     1. HORIZONTAL VARIANT (Cart, Checkout, Comparison)
     ───────────────────────────────────────────────────────────── */
  if (variant === "horizontal") {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <Card hover className={cn("overflow-hidden p-4 interactive-card border-border/80 hover:border-accent/50", className)}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <img
                src={imageInfo.url}
                alt={imageInfo.alt}
                loading="lazy"
                className="h-20 w-20 rounded-2xl object-cover shrink-0 bg-slate-100 dark:bg-slate-800"
              />
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold text-[#FF6A00] bg-orange-500/10 px-2 py-0.5 rounded-md uppercase tracking-wider">
                    {categoryName}
                  </span>
                  <Link
                    to={`/services/${categorySlug}/${slug}`}
                    className="font-heading text-base font-bold text-primary hover:text-accent transition-colors truncate"
                  >
                    {name}
                  </Link>
                  {showPopular && (
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-full">
                      Popular
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  {rating && reviewCount > 0 && (
                    <Rating value={rating} reviewCount={reviewCount} size="sm" />
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-[#FF6A00]" />
                    {durationText}
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                  {shortDescription}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
              <div className="text-left sm:text-right min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block leading-tight">
                  {priceView.label}
                </span>
                <div className="font-heading text-lg sm:text-xl font-extrabold text-primary dark:text-white">
                  {priceView.priceFormatted}
                </div>
                {priceView.originalPriceFormatted && (
                  <div className="text-xs text-slate-400 line-through">
                    {priceView.originalPriceFormatted}
                  </div>
                )}
              </div>

              <Button
                size="sm"
                variant={isAdded ? "outline" : "accent"}
                onClick={handleActionClick}
                leftIcon={isAdded ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                className={cn("shrink-0 font-bold h-10 px-4 rounded-xl whitespace-nowrap", !isAdded && "hover:shadow-glow transition-all")}
              >
                {isAdded ? "Added" : priceView.ctaText}
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  /* ─────────────────────────────────────────────────────────────
     2. GRID VARIANT (Standard Catalogue Card — Production Structure)
     ───────────────────────────────────────────────────────────── */
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="h-full"
    >
      <Card hover className={cn("overflow-hidden flex flex-col h-full interactive-card border-border/80 hover:border-[#FF6A00]/50 group rounded-2xl shadow-xs hover:shadow-lg transition-all duration-300 bg-card", className)}>
        {/* 1. Image Area (Fixed aspect-16/10 ratio, clean overlay badges) */}
        <div className="relative aspect-16/10 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
          <img
            src={imageInfo.url}
            alt={imageInfo.alt}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Badges Overlay: Maximum ONE primary badge on left, optional compact warranty on right */}
          <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none gap-2">
            {showPopular ? (
              <span className="text-[10px] font-bold text-amber-900 dark:text-amber-200 bg-amber-400/90 dark:bg-amber-500/80 backdrop-blur-md px-2.5 py-0.5 rounded-full shadow-xs pointer-events-auto">
                Popular
              </span>
            ) : showNew ? (
              <span className="text-[10px] font-bold text-emerald-900 dark:text-emerald-100 bg-emerald-400/90 dark:bg-emerald-500/80 backdrop-blur-md px-2.5 py-0.5 rounded-full shadow-xs pointer-events-auto">
                New
              </span>
            ) : (
              <div />
            )}

            {compactWarranty && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-700 dark:text-slate-200 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md px-2 py-0.5 rounded-full border border-slate-200/80 dark:border-slate-700/80 shadow-xs pointer-events-auto">
                <Shield className="w-3 h-3 text-[#FF6A00] shrink-0" />
                <span className="truncate max-w-30">{compactWarranty}</span>
              </span>
            )}
          </div>
        </div>

        {/* 2. Card Content (Flex column with flex-1 to guarantee uniform card heights) */}
        <CardContent className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            {/* Category & Rating */}
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#FF6A00] bg-orange-500/10 px-2 py-0.5 rounded-md truncate max-w-45">
                {categoryName}
              </span>
              {rating && reviewCount > 0 && (
                <Rating value={rating} reviewCount={reviewCount} size="sm" />
              )}
            </div>

            {/* Service Title: max 2 lines (Section 12) */}
            <Link
              to={`/services/${categorySlug}/${slug}`}
              className="font-heading text-base sm:text-lg font-bold text-primary dark:text-white group-hover:text-[#FF6A00] dark:group-hover:text-[#FF6A00] transition-colors block line-clamp-2 leading-snug"
              title={name}
            >
              {name}
            </Link>

            {/* Short Description: max 2 lines (Section 13) */}
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
              {shortDescription}
            </p>

            {/* Duration (Section 14) */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 pt-0.5">
              <Clock className="h-3.5 w-3.5 text-[#FF6A00] shrink-0" />
              <span>{durationText}</span>
            </div>

            {/* Pricing Transparency Detail: Only when materials are extra */}
            {requiresMaterials && (
              <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-medium pt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                <span>Parts/materials extra at MRP</span>
              </div>
            )}
          </div>

          {/* 3. Card Footer (mt-auto guarantees all CTA buttons align across the grid) */}
          <div className="mt-auto pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2.5">
            {/* Price Block: flex-1, min-w-0 to prevent button push */}
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block leading-tight truncate">
                {priceView.label}
              </span>
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="font-heading text-lg sm:text-xl font-extrabold text-primary dark:text-white truncate">
                  {priceView.priceFormatted}
                </span>
                {priceView.originalPriceFormatted && (
                  <span className="text-xs text-slate-400 line-through">
                    {priceView.originalPriceFormatted}
                  </span>
                )}
                {priceView.discountLabel && (
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    {priceView.discountLabel}
                  </span>
                )}
              </div>
            </div>

            {/* Book Now Button: shrink-0, whitespace-nowrap, never clipped */}
            <Button
              size="sm"
              variant={isAdded ? "outline" : "accent"}
              onClick={handleActionClick}
              leftIcon={isAdded ? <Check className="h-4 w-4 text-emerald-600" /> : <Plus className="h-4 w-4" />}
              className={cn(
                "shrink-0 h-10 px-3.5 sm:px-4 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap cursor-pointer",
                !isAdded && "shadow-sm shadow-orange-500/20 hover:shadow-orange-500/30 transition-all active:scale-95"
              )}
              aria-label={`${isAdded ? "Remove" : priceView.ctaText} ${name}`}
            >
              {isAdded ? "Added" : priceView.ctaText}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
