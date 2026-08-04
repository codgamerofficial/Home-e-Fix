import { X, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface FilterCategory {
  id: string;
  name: string;
}

export interface FiltersProps {
  categories?: FilterCategory[];
  selectedCategoryId?: string;
  onSelectCategory?: (id: string | undefined) => void;
  priceRange?: [number, number];
  onPriceChange?: (range: [number, number]) => void;
  minRating?: number;
  onRatingChange?: (rating: number | undefined) => void;
  sortBy?: string;
  onSortChange?: (sort: string) => void;
  onClearAll?: () => void;
  className?: string;
}

export function FilterPanel({
  categories = [],
  selectedCategoryId,
  onSelectCategory,
  minRating,
  onRatingChange,
  sortBy = "popular",
  onSortChange,
  onClearAll,
  className,
}: FiltersProps) {
  const ratings = [4.5, 4.0, 3.5];
  const sortOptions = [
    { label: "Most Popular", value: "popular" },
    { label: "Price: Low to High", value: "price_asc" },
    { label: "Price: High to Low", value: "price_desc" },
    { label: "Highest Rated", value: "rating" },
  ];

  return (
    <div className={cn("space-y-6 rounded-2xl border border-border bg-surface p-5 shadow-card", className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="font-heading font-semibold text-base text-primary">
          Filters
        </h3>
        {onClearAll && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-foreground-muted hover:text-accent"
            leftIcon={<RotateCcw className="h-3 w-3" />}
            onClick={onClearAll}
          >
            Reset
          </Button>
        )}
      </div>

      {/* Categories Filter */}
      {categories.length > 0 && (
        <div className="space-y-2.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-foreground-muted block">
            Categories
          </label>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => onSelectCategory?.(undefined)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors cursor-pointer",
                !selectedCategoryId
                  ? "border-accent bg-accent text-white font-semibold"
                  : "border-border bg-surface text-foreground-secondary hover:bg-muted"
              )}
            >
              All Services
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory?.(cat.id)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors cursor-pointer",
                  selectedCategoryId === cat.id
                    ? "border-accent bg-accent text-white font-semibold"
                    : "border-border bg-surface text-foreground-secondary hover:bg-muted"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Minimum Rating */}
      <div className="space-y-2.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-foreground-muted block">
          Rating
        </label>
        <div className="flex flex-wrap gap-1.5">
          {ratings.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onRatingChange?.(minRating === r ? undefined : r)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors cursor-pointer",
                minRating === r
                  ? "bg-amber-400/10 text-amber-500 font-semibold border-amber-400/40"
                  : "border-border bg-surface text-foreground-secondary hover:bg-muted"
              )}
            >
              ★ {r}+ Stars
            </button>
          ))}
        </div>
      </div>

      {/* Sort By */}
      <div className="space-y-2.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-foreground-muted block">
          Sort By
        </label>
        <div className="space-y-1">
          {sortOptions.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2.5 text-xs text-foreground cursor-pointer py-1"
            >
              <input
                type="radio"
                name="sortBy"
                value={opt.value}
                checked={sortBy === opt.value}
                onChange={() => onSortChange?.(opt.value)}
                className="h-3.5 w-3.5 accent-accent"
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * FilterChipsBar — displays active applied filters with remove buttons.
 */
export function FilterChipsBar({
  chips,
  onRemoveChip,
  onClearAll,
  className,
}: {
  chips: { id: string; label: string }[];
  onRemoveChip: (id: string) => void;
  onClearAll?: () => void;
  className?: string;
}) {
  if (chips.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-2 py-2", className)}>
      <span className="text-xs font-medium text-foreground-muted">Active Filters:</span>
      {chips.map((chip) => (
        <Badge
          key={chip.id}
          variant="secondary"
          className="gap-1.5 pl-2.5 pr-1.5 py-1 text-xs"
        >
          {chip.label}
          <button
            type="button"
            onClick={() => onRemoveChip(chip.id)}
            className="rounded-full p-0.5 hover:bg-muted-foreground/20 cursor-pointer"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      {onClearAll && (
        <button
          type="button"
          onClick={onClearAll}
          className="text-xs text-accent hover:underline font-medium cursor-pointer ml-1"
        >
          Clear All
        </button>
      )}
    </div>
  );
}
