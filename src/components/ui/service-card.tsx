import { Link } from "react-router";
import { Clock, Plus, Check } from "lucide-react";
import { cn, formatCurrency, formatDuration } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Rating } from "@/components/ui/rating";
import type { Service } from "@/types/service.types";

export interface ServiceCardProps {
  service: Partial<Service>;
  isAdded?: boolean;
  onAdd?: (service: Partial<Service>) => void;
  onRemove?: (service: Partial<Service>) => void;
  variant?: "grid" | "horizontal";
  className?: string;
}

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

  if (variant === "horizontal") {
    return (
      <Card hover className={cn("overflow-hidden p-4", className)}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            {thumbnail && (
              <img
                src={thumbnail}
                alt={name}
                className="h-16 w-16 rounded-xl object-cover shrink-0"
              />
            )}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Link
                  to={`/services/${categorySlug}/${slug}`}
                  className="font-heading text-base font-semibold text-primary hover:text-accent transition-colors"
                >
                  {name}
                </Link>
                {isPopular && <Badge variant="accent">Popular</Badge>}
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
            >
              {isAdded ? "Added" : "Add"}
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Default Grid Variant
  return (
    <Card hover className={cn("overflow-hidden flex flex-col h-full", className)}>
      {/* Thumbnail Header */}
      <div className="relative aspect-video w-full bg-muted overflow-hidden">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-primary/10 to-accent/10 text-3xl">
            🔧
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {isPopular && <Badge variant="accent">Popular</Badge>}
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Rating value={rating} reviewCount={reviewCount} size="sm" />
            <span className="flex items-center gap-1 text-xs text-foreground-muted">
              <Clock className="h-3.5 w-3.5" />
              {formatDuration(duration)}
            </span>
          </div>

          <Link
            to={`/services/${categorySlug}/${slug}`}
            className="font-heading text-base font-semibold text-primary hover:text-accent transition-colors block line-clamp-1"
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
            leftIcon={isAdded ? <Check className="h-4 w-4 text-success" /> : <Plus className="h-4 w-4" />}
          >
            {isAdded ? "Added" : "Add"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
