import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Search, X, Wrench, Calendar, User, Shield, ArrowRight } from "lucide-react";
import { SERVICE_CATEGORIES } from "@/constants/services";
import { ROUTES } from "@/constants/routes";
import { useSearch } from "@/context/SearchContext";

export function CommandMenu() {
  const navigate = useNavigate();
  const { isSearchOpen, closeSearch } = useSearch();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when search opens
  useEffect(() => {
    if (isSearchOpen) {
      // Small timeout ensures the DOM node is painted and ready
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setQuery("");
    }
  }, [isSearchOpen]);

  const filteredCategories = SERVICE_CATEGORIES.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.description.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelectRoute = (path: string) => {
    closeSearch();
    setQuery("");
    navigate(path);
  };

  if (!isSearchOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search Home-e-Fix"
      onMouseDown={(e) => {
        // Only close if clicking directly on the backdrop, not children
        if (e.target === e.currentTarget) {
          closeSearch();
        }
      }}
      className="fixed inset-0 z-(--z-modal) bg-black/80 backdrop-blur-md flex items-start justify-center pt-16 sm:pt-24 p-4 animate-in fade-in duration-150"
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-2xl border border-white/20 bg-[#07172E] shadow-glow-blue overflow-hidden animate-in zoom-in-95 duration-150 text-white flex flex-col max-h-[85vh]"
      >
        {/* Search Input Bar with functional ESC and Close buttons */}
        <div className="flex items-center px-4 border-b border-white/10 bg-[#0A1F3E] shrink-0">
          <Search className="h-4 w-4 text-accent shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                e.stopPropagation();
                closeSearch();
              }
            }}
            placeholder="Search services, categories, bookings, support... (Esc to close)"
            aria-label="Search services, categories, bookings, support"
            className="w-full bg-transparent px-3 py-4 text-xs sm:text-sm text-white placeholder:text-white/60 focus:outline-hidden"
          />

          {/* Interactive ESC button */}
          <button
            type="button"
            onClick={closeSearch}
            aria-label="Press Escape to close"
            title="Press Escape to close"
            className="hidden sm:inline-flex items-center justify-center px-2 py-1 text-[10px] font-mono font-bold text-white/80 bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 rounded-md cursor-pointer transition-all mr-2"
          >
            ESC
          </button>

          {/* Explicit Accessible Close Button (Min 44x44px touch target) */}
          <button
            type="button"
            onClick={closeSearch}
            aria-label="Close search"
            title="Close search"
            className="min-h-11 min-w-11 flex items-center justify-center rounded-xl text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Search Results List */}
        <div className="overflow-y-auto p-3 space-y-3 flex-1">
          {/* Service Categories */}
          <div>
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white/60">
              Service Categories ({filteredCategories.length})
            </div>

            {filteredCategories.length === 0 ? (
              <div className="py-8 text-center text-xs text-white/60 space-y-1">
                <p className="font-semibold text-white/80">No categories found matching "{query}"</p>
                <p className="text-[11px]">Try searching for Electrical, Plumbing, AC, or Cleaning.</p>
              </div>
            ) : (
              <div className="space-y-1 mt-1">
                {filteredCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelectRoute(`${ROUTES.SERVICES}/${cat.slug}`)}
                    className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-white/10 text-left transition-colors cursor-pointer group border border-transparent hover:border-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl" aria-hidden="true">{cat.icon}</span>
                      <div>
                        <h5 className="font-heading text-xs sm:text-sm font-bold text-white group-hover:text-accent transition-colors">
                          {cat.name}
                        </h5>
                        <p className="text-[11px] text-white/70 line-clamp-1">{cat.description}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-white/40 group-hover:text-accent group-hover:translate-x-1 transition-all shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Shortcuts */}
          <div className="border-t border-white/10 pt-3">
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white/60">
              Quick Shortcuts
            </div>
            <div className="grid grid-cols-2 gap-1.5 mt-1">
              <button
                type="button"
                onClick={() => handleSelectRoute(ROUTES.BOOKING)}
                className="flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold text-white/90 hover:bg-white/10 hover:text-accent cursor-pointer transition-colors"
              >
                <Calendar className="h-4 w-4 text-accent" /> Book a Service
              </button>
              <button
                type="button"
                onClick={() => handleSelectRoute("/app/bookings")}
                className="flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold text-white/90 hover:bg-white/10 hover:text-accent cursor-pointer transition-colors"
              >
                <User className="h-4 w-4 text-accent" /> My Bookings
              </button>
              <button
                type="button"
                onClick={() => handleSelectRoute("/technician/jobs")}
                className="flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold text-white/90 hover:bg-white/10 hover:text-accent cursor-pointer transition-colors"
              >
                <Wrench className="h-4 w-4 text-accent" /> Technician Portal
              </button>
              <button
                type="button"
                onClick={() => handleSelectRoute("/admin/analytics")}
                className="flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold text-white/90 hover:bg-white/10 hover:text-accent cursor-pointer transition-colors"
              >
                <Shield className="h-4 w-4 text-accent" /> Admin Operations
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
