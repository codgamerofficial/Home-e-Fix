import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Search, Wrench, Calendar, User, Shield, ArrowRight } from "lucide-react";
import { SERVICE_CATEGORIES } from "@/constants/services";
import { ROUTES } from "@/constants/routes";
import { useUIStore } from "@/store/ui.store";

export function CommandMenu() {
  const navigate = useNavigate();
  const { searchOpen, setSearchOpen } = useUIStore();
  const [query, setQuery] = useState("");

  // Keyboard shortcut listener Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(!searchOpen);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen, setSearchOpen]);

  const filteredCategories = SERVICE_CATEGORIES.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.description.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelectRoute = (path: string) => {
    setSearchOpen(false);
    setQuery("");
    navigate(path);
  };

  if (!searchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-16 sm:pt-24 p-4">
      <div className="w-full max-w-xl rounded-2xl border border-white/20 bg-[#07172E] shadow-glow-blue overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-white">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-white/10 bg-[#0A1F3E]">
          <Search className="h-4 w-4 text-accent shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search services, categories, bookings, support... (Esc to close)"
            className="w-full bg-transparent px-3 py-4 text-xs sm:text-sm text-white placeholder:text-white/60 focus:outline-hidden"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-bold text-white/70 bg-white/10 border border-white/20 rounded-md">
            ESC
          </kbd>
        </div>

        {/* Search Results List */}
        <div className="max-h-80 overflow-y-auto p-3 space-y-3">
          {/* Service Categories */}
          <div>
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white/60">
              Service Categories ({filteredCategories.length})
            </div>
            <div className="space-y-1 mt-1">
              {filteredCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelectRoute(`${ROUTES.SERVICES}/${cat.slug}`)}
                  className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-white/10 text-left transition-colors cursor-pointer group border border-transparent hover:border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{cat.icon}</span>
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
          </div>

          {/* Quick Actions */}
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
                onClick={() => handleSelectRoute("/dashboard/orders")}
                className="flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold text-white/90 hover:bg-white/10 hover:text-accent cursor-pointer transition-colors"
              >
                <User className="h-4 w-4 text-accent" /> Customer Orders
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
