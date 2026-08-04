import React from "react";
import { Search, MapPin, X, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface SearchBarProps {
  value?: string;
  onChange?: (val: string) => void;
  onSearch?: (val: string) => void;
  placeholder?: string;
  location?: string;
  onLocationClick?: () => void;
  onFilterClick?: () => void;
  suggestions?: string[];
  onSelectSuggestion?: (suggestion: string) => void;
  className?: string;
}

export function SearchBar({
  value = "",
  onChange,
  onSearch,
  placeholder = "Search for AC repair, plumbing, cleaning...",
  location = "Hitech City, Hyderabad",
  onLocationClick,
  onFilterClick,
  suggestions = [],
  onSelectSuggestion,
  className,
}: SearchBarProps) {
  const [internalVal, setInternalVal] = React.useState(value);
  const [isFocused, setIsFocused] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setInternalVal(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setInternalVal(newVal);
    onChange?.(newVal);
  };

  const handleClear = () => {
    setInternalVal("");
    onChange?.("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(internalVal);
    setIsFocused(false);
  };

  // Close dropdown on click outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={cn("relative w-full max-w-3xl", className)}>
      <form
        onSubmit={handleSubmit}
        className={cn(
          "flex items-center rounded-2xl border bg-surface p-1.5 shadow-card transition-all duration-200",
          isFocused
            ? "border-accent ring-2 ring-accent/20 shadow-card-hover"
            : "border-border hover:border-foreground-muted"
        )}
      >
        {/* Location Selector Pill */}
        <button
          type="button"
          onClick={onLocationClick}
          className="flex items-center gap-1.5 rounded-xl bg-muted/60 px-3 py-2 text-xs font-medium text-primary hover:bg-muted transition-colors shrink-0 max-w-37.5 sm:max-w-50 truncate cursor-pointer"
        >
          <MapPin className="h-3.5 w-3.5 text-accent shrink-0" />
          <span className="truncate">{location}</span>
        </button>

        <div className="h-6 w-px bg-border mx-2 shrink-0 hidden sm:block" />

        {/* Input */}
        <div className="relative flex-1 flex items-center">
          <Search className="h-4 w-4 text-muted-foreground ml-2 shrink-0" />
          <input
            type="text"
            value={internalVal}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            placeholder={placeholder}
            className="w-full bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {internalVal && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-muted-foreground hover:text-foreground mr-1 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Trigger Button */}
        {onFilterClick && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onFilterClick}
            className="text-foreground-secondary shrink-0"
            aria-label="Open Filters"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        )}

        {/* Search Action Button */}
        <Button
          type="submit"
          variant="accent"
          size="sm"
          className="rounded-xl px-4 shrink-0 hidden sm:inline-flex"
        >
          Search
        </Button>
      </form>

      {/* Auto-suggestions Dropdown */}
      {isFocused && suggestions.length > 0 && (
        <div className="absolute left-0 top-full z-(--z-popover) mt-2 w-full rounded-2xl border border-border bg-surface p-2 shadow-xl">
          <div className="px-3 py-1.5 text-[11px] font-semibold uppercase text-foreground-muted tracking-wider">
            Popular Searches
          </div>
          {suggestions.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setInternalVal(item);
                onSelectSuggestion?.(item);
                setIsFocused(false);
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors text-left cursor-pointer"
            >
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{item}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
