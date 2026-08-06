import { Link } from "react-router";
import { motion } from "framer-motion";
import { Clock, Plus, Check } from "lucide-react";
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
  appliance: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&q=80",
  marble: "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=600&q=80",
  "interior-repair": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&q=80",
};

export function ServiceCard({
  service,
  isAdded = false,
  onAdd,
  onRemove,
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
    thumbnail,
    category,
  } = service;

  const categorySlug = category?.slug || "general";
  const hasDiscount = discountedPrice && discountedPrice < basePrice;
  const displayImage =
    thumbnail ||
    CATEGORY_IMAGE_FALLBACKS[categorySlug] ||
    category?.bannerImage ||
    "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&q=80";

  if (variant === "horizontal") {
    return (
      <motion.div
        whileHover={{ y: -3, scale: 1.01 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <Card hover className={cn("overflow-hidden p-4 interactive-card border-border/80 hover:border-accent/50", className)}>
          <div className="flex items-center justify-between gap-4">
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
                className="h-16 w-16 rounded-xl object-cover shrink-0"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/services/${categorySlug}/${slug}`}
                    className="font-heading text-base font-semibold text-primary hover:text-accent transition-colors"
                  >
                    {name}
                  </Link>
                  {isPopular && <Badge variant="accent" className="animate-pulse">Popular</Badge>}
                </div>

                <div className="flex items-center gap-3 text-xs text-foreground-muted">
                  <Rating value={rating} reviewCount={reviewCount} size="sm" />
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(duration)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <div className="font-heading text-lg font-bold text-primary">
                  {formatCurrency(discountedPrice || basePrice)}
                </div>
                {hasDiscount && (
                  <div className="text-xs text-foreground-muted line-through">
                    {formatCurrency(basePrice)}
                  </div>
                )}
              </div>

              <Button
                size="sm"
                variant={isAdded ? "outline" : "accent"}
                onClick={() => (isAdded ? onRemove?.(service) : onAdd?.(service))}
                leftIcon={isAdded ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                className={cn(!isAdded && "hover:shadow-glow transition-all")}
              >
                {isAdded ? "Added" : "Add"}
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  // Default Grid Variant
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="h-full"
    >
      <Card hover className={cn("overflow-hidden flex flex-col h-full interactive-card border-border/80 hover:border-accent/60 group", className)}>
        {/* Thumbnail Header */}
        <div className="relative aspect-video w-full bg-muted overflow-hidden">
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
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {isPopular && <Badge variant="accent" className="shadow-md">Popular</Badge>}
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Rating value={rating} reviewCount={reviewCount} size="sm" />
              <span className="flex items-center gap-1 text-xs text-foreground-muted">
                <Clock className="h-3.5 w-3.5 text-accent" />
                {formatDuration(duration)}
              </span>
            </div>

            <Link
              to={`/services/${categorySlug}/${slug}`}
              className="font-heading text-base font-bold text-primary group-hover:text-accent transition-colors block line-clamp-1"
            >
              {name}
            </Link>

            <p className="text-xs text-foreground-secondary line-clamp-2 leading-relaxed">
              {shortDescription}
            </p>
          </div>

          {/* Price & Action */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div>
              <div className="font-heading text-lg font-extrabold text-primary">
                {formatCurrency(discountedPrice || basePrice)}
              </div>
              {hasDiscount && (
                <div className="text-xs text-foreground-muted line-through">
                  {formatCurrency(basePrice)}
                </div>
              )}
            </div>

            <Button
              size="sm"
              variant={isAdded ? "outline" : "accent"}
              onClick={() => (isAdded ? onRemove?.(service) : onAdd?.(service))}
              leftIcon={isAdded ? <Check className="h-4 w-4 text-success" /> : <Plus className="h-4 w-4" />}
              className={cn(!isAdded && "shadow-md hover:shadow-glow transition-all")}
            >
              {isAdded ? "Added" : "Add"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
