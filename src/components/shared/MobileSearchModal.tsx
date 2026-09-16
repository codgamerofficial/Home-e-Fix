import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Search,
  X,
  Clock,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Layers,
} from "lucide-react";
import { useSearch } from "@/context/SearchContext";
import { SERVICE_CATEGORIES, POPULAR_SERVICES } from "@/constants/services";
import { ROUTES } from "@/constants/routes";
import { formatCurrency } from "@/lib/currency";

const POPULAR_SEARCH_TAGS = [
  "AC Deep Cleaning",
  "Ceiling Fan Installation",
  "Bathroom Deep Cleaning",
  "Drainage Blockage",
  "Switchboard Repair",
  "Full Home Painting",
  "Water Purifier Service",
];

const RECENT_SEARCHES_KEY = "homeefix_recent_searches";

export function MobileSearchModal() {
  const navigate = useNavigate();
  const { isSearchOpen, closeSearch } = useSearch();

  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch {
      setRecentSearches([]);
    }
  }, [isSearchOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isSearchOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setQuery("");
    }
  }, [isSearchOpen]);

  // Filter categories matching query
  const matchingCategories = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return SERVICE_CATEGORIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }, [query]);

  // Filter services matching query
  const matchingServices = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return POPULAR_SERVICES.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.shortDescription.toLowerCase().includes(q) ||
        s.category?.name?.toLowerCase().includes(q)
    );
  }, [query]);

  const recordRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    const updated = [trimmed, ...recentSearches.filter((t) => t !== trimmed)].slice(0, 6);
    setRecentSearches(updated);
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {}
  };

  const handleSelectService = (service: any) => {
    recordRecentSearch(service.name);
    closeSearch();
    const catSlug = service.category?.slug || service.category || "electrical";
    navigate(`/services/${catSlug}/${service.slug}`);
  };

  const handleSelectCategory = (category: any) => {
    recordRecentSearch(category.name);
    closeSearch();
    navigate(`/services/${category.slug}`);
  };

  const handleSelectTag = (tag: string) => {
    setQuery(tag);
    recordRecentSearch(tag);
  };

  const handleClearRecents = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {}
  };

  if (!isSearchOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search Services"
      className="fixed inset-0 z-(--z-modal) flex flex-col bg-background text-foreground animate-in fade-in duration-150"
    >
      {/* ─── Top App Bar (< md) ─── */}
      <div className="flex items-center gap-2 border-b border-border bg-surface px-3 py-2.5 shadow-xs pt-safe">
        {/* Back Button */}
        <button
          type="button"
          onClick={closeSearch}
          className="flex h-11 w-11 items-center justify-center rounded-xl text-foreground-muted hover:bg-muted hover:text-foreground active:scale-95 transition-all min-touch-target cursor-pointer shrink-0"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        {/* Input Wrapper */}
        <div className="relative flex flex-1 items-center">
          <Search className="absolute left-3 h-4 w-4 text-accent shrink-0" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search AC, Electrician, Cleaning..."
            className="w-full rounded-2xl border border-border bg-background py-2.5 pl-9.5 pr-8 text-sm text-foreground placeholder:text-foreground-muted focus:border-accent focus:outline-hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-muted text-foreground-muted hover:text-foreground cursor-pointer"
              aria-label="Clear search query"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Cancel Action */}
        <button
          type="button"
          onClick={closeSearch}
          className="text-xs font-bold text-foreground-secondary hover:text-accent px-2 py-2 min-touch-target flex items-center justify-center cursor-pointer"
        >
          Cancel
        </button>
      </div>

      {/* ─── Search Body ─── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-safe">
        {/* 1. QUERY TYPED: SHOW MATCHES */}
        {query.trim() ? (
          <div className="space-y-5">
            {/* Matching Services */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-foreground-muted mb-2">
                Services ({matchingServices.length})
              </div>

              {matchingServices.length === 0 && matchingCategories.length === 0 ? (
                <div className="py-12 text-center text-xs text-foreground-muted space-y-2">
                  <p className="font-semibold text-sm text-foreground">
                    No results found for "{query}"
                  </p>
                  <p>Try searching for "AC Repair", "Fan", "Plumber", or "Bathroom".</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {matchingServices.map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => handleSelectService(service)}
                      className="w-full flex items-center justify-between p-3 rounded-2xl border border-border bg-surface hover:border-accent hover:bg-accent/5 text-left transition-all min-touch-target cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={service.thumbnail}
                          alt={service.name}
                          className="h-11 w-11 rounded-xl object-cover shrink-0"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&q=80";
                          }}
                        />
                        <div>
                          <h4 className="font-heading text-xs sm:text-sm font-bold text-primary dark:text-white group-hover:text-accent transition-colors line-clamp-1">
                            {service.name}
                          </h4>
                          <span className="text-[11px] text-foreground-muted block">
                            Starts at {formatCurrency(service.discountedPrice || service.basePrice)} • 30-Day Warranty
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-foreground-muted group-hover:text-accent group-hover:translate-x-1 transition-all shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Matching Categories */}
            {matchingCategories.length > 0 && (
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-foreground-muted mb-2">
                  Categories ({matchingCategories.length})
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {matchingCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleSelectCategory(cat)}
                      className="flex items-center gap-2.5 p-3 rounded-2xl border border-border bg-surface hover:border-accent text-left transition-all min-touch-target cursor-pointer"
                    >
                      <span className="text-xl shrink-0">{cat.icon}</span>
                      <div className="truncate">
                        <span className="text-xs font-bold text-primary dark:text-white block truncate">
                          {cat.name}
                        </span>
                        <span className="text-[10px] text-foreground-muted">
                          {cat.count} services
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* 2. QUERY EMPTY: SHOW RECENTS, POPULAR, CATEGORIES */
          <div className="space-y-6">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground-muted flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-accent" /> Recent Searches
                  </span>
                  <button
                    type="button"
                    onClick={handleClearRecents}
                    className="text-[11px] font-semibold text-foreground-muted hover:text-rose-500"
                  >
                    Clear
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectTag(term)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-foreground hover:border-accent hover:text-accent transition-colors cursor-pointer"
                    >
                      <span>{term}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Searches */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-foreground-muted flex items-center gap-1.5 mb-2.5">
                <TrendingUp className="h-3.5 w-3.5 text-accent" /> Popular Services
              </span>

              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCH_TAGS.map((tag, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectTag(tag)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-accent/20 bg-accent/5 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent hover:text-white transition-all cursor-pointer"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>{tag}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Top Categories */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-foreground-muted flex items-center gap-1.5 mb-2.5">
                <Layers className="h-3.5 w-3.5 text-accent" /> Explore Categories
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SERVICE_CATEGORIES.slice(0, 8).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelectCategory(cat)}
                    className="flex items-center gap-2.5 p-3 rounded-2xl border border-border bg-surface hover:border-accent hover:bg-accent/5 text-left transition-all min-touch-target cursor-pointer group"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">
                      {cat.icon}
                    </span>
                    <div className="truncate">
                      <span className="text-xs font-bold text-primary dark:text-white block group-hover:text-accent transition-colors truncate">
                        {cat.name}
                      </span>
                      <span className="text-[10px] text-foreground-muted">
                        Starting ₹{cat.startingPrice}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
