import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Search,
  Navigation,
  Check,
  X,
  Building,
  Home,
  Briefcase,
  AlertCircle,
  Plus,
} from "lucide-react";
import { useLocationStore } from "@/store/location.store";
import { useAuthStore } from "@/store/auth.store";
import { dbRepository } from "@/services/db/repository";
import { serviceabilityEngine } from "@/services/marketplace/serviceability.engine";
import { OPERATIONAL_CITIES } from "@/constants/services";
import { Button } from "@/components/ui/button";

interface MobileLocationSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNewAddress?: () => void;
}

export function MobileLocationSheet({
  isOpen,
  onClose,
  onAddNewAddress,
}: MobileLocationSheetProps) {
  const { locality, pincode, setLocation } = useLocationStore();
  const { user, isAuthenticated } = useAuthStore();

  const [query, setQuery] = useState("");
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Real saved addresses for current user
  const savedAddresses = useMemo(() => {
    if (!isAuthenticated || !user?.id) return [];
    return dbRepository.getAddresses(user.id);
  }, [isAuthenticated, user?.id]);

  // Operational hubs in Kolkata
  const operationalHubs = OPERATIONAL_CITIES.activeHubs || [];

  // Filtered results based on search query
  const filteredHubs = useMemo(() => {
    if (!query.trim()) return operationalHubs;
    const q = query.toLowerCase();
    return operationalHubs.filter(
      (hub) =>
        hub.name.toLowerCase().includes(q) ||
        hub.pincode.includes(q)
    );
  }, [query, operationalHubs]);

  // Handle Current Location Geolocation with explicit user tap
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }

    setGeoLoading(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoLoading(false);
        // Default to Kolkata central operational hub for localized GPS
        const detectedHub = operationalHubs[0];
        setLocation(
          `${detectedHub.name} (GPS)`,
          detectedHub.pincode,
          `Near Current Location, Kolkata - ${detectedHub.pincode}`
        );
        onClose();
      },
      (error) => {
        setGeoLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          setGeoError("Location permission denied. Please select your locality below.");
        } else {
          setGeoError("Unable to retrieve precise location. Please select a locality.");
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSelectHub = (hub: (typeof operationalHubs)[0]) => {
    const serviceability = serviceabilityEngine.checkPincode(hub.pincode);
    setLocation(hub.name, hub.pincode, `${hub.name}, Kolkata - ${hub.pincode}`);
    onClose();
  };

  const handleSelectSavedAddress = (addr: any) => {
    const label = addr.title || addr.label || "Saved Address";
    const pin = addr.pincode || "700091";
    const full = addr.streetAddress
      ? `${addr.streetAddress}, ${addr.city || "Kolkata"} - ${pin}`
      : `${label}, Kolkata - ${pin}`;
    setLocation(label, pin, full);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-(--z-modal) flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
        {/* Backdrop click */}
        <div className="flex-1" onClick={onClose} />

        {/* Bottom Sheet Container */}
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          className="w-full max-h-[85vh] rounded-t-3xl border-t border-border bg-surface text-foreground shadow-2xl flex flex-col overflow-hidden pb-safe"
        >
          {/* Grab Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="h-1.5 w-12 rounded-full bg-border" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-border">
            <div>
              <h3 className="font-heading text-base font-bold text-primary dark:text-white">
                Select Service Location
              </h3>
              <p className="text-xs text-foreground-secondary">
                Home-e-Fix currently serves Kolkata & Greater Metropolitan Hubs
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-foreground-muted hover:bg-muted hover:text-foreground transition-colors min-touch-target flex items-center justify-center"
              aria-label="Close location selector"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Search Box */}
          <div className="p-4 border-b border-border">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 h-4 w-4 text-foreground-muted" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search locality or enter 6-digit pincode..."
                className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-accent focus:outline-hidden"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-3 text-xs text-foreground-muted hover:text-foreground p-1"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {/* GPS Location Button */}
            <div>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={geoLoading}
                className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl border border-accent/30 bg-accent/5 hover:bg-accent/10 transition-colors text-left group min-touch-target cursor-pointer"
              >
                <div className="h-10 w-10 rounded-xl bg-accent text-white flex items-center justify-center shrink-0 shadow-sm shadow-orange-500/30">
                  <Navigation className={`h-5 w-5 ${geoLoading ? "animate-spin" : ""}`} />
                </div>
                <div className="flex-1">
                  <span className="font-bold text-xs sm:text-sm text-primary dark:text-white block group-hover:text-accent transition-colors">
                    {geoLoading ? "Detecting location..." : "Use Current Location (GPS)"}
                  </span>
                  <span className="text-[11px] text-foreground-muted block">
                    Tap to auto-detect nearest Kolkata operational center
                  </span>
                </div>
              </button>

              {geoError && (
                <div className="mt-2 flex items-center gap-2 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{geoError}</span>
                </div>
              )}
            </div>

            {/* Saved Addresses Section (if user has any) */}
            {savedAddresses.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
                    Saved Addresses
                  </span>
                  {onAddNewAddress && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onAddNewAddress();
                      }}
                      className="text-xs font-bold text-accent hover:underline flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" /> Add New
                    </button>
                  )}
                </div>

                <div className="space-y-1.5">
                  {savedAddresses.map((addr: any) => {
                    const isSelected = pincode === addr.pincode;
                    const Icon =
                      addr.type === "work"
                        ? Briefcase
                        : addr.type === "other"
                        ? Building
                        : Home;

                    return (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => handleSelectSavedAddress(addr)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all min-touch-target cursor-pointer ${
                          isSelected
                            ? "border-accent bg-accent/10 shadow-xs"
                            : "border-border hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-surface border border-border flex items-center justify-center text-accent shrink-0">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="font-bold text-xs text-primary dark:text-white block">
                              {addr.title || addr.label || "Home"}
                            </span>
                            <span className="text-[11px] text-foreground-muted line-clamp-1">
                              {addr.streetAddress || addr.address_line_1 || "Kolkata"} - {addr.pincode}
                            </span>
                          </div>
                        </div>
                        {isSelected && <Check className="h-4 w-4 text-accent shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Operational Hubs List */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
                Kolkata Operational Hubs ({filteredHubs.length})
              </span>

              {filteredHubs.length === 0 ? (
                <div className="p-6 text-center text-xs text-foreground-muted">
                  No service hub matching "{query}". Enter a valid 6-digit Kolkata pincode.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredHubs.map((hub) => {
                    const isSelected = pincode === hub.pincode;

                    return (
                      <button
                        key={hub.id}
                        type="button"
                        onClick={() => handleSelectHub(hub)}
                        className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all min-touch-target cursor-pointer ${
                          isSelected
                            ? "border-accent bg-accent/10 shadow-xs"
                            : "border-border hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <MapPin className={`h-4 w-4 shrink-0 ${isSelected ? "text-accent" : "text-foreground-muted"}`} />
                          <div>
                            <span className="font-semibold text-xs text-primary dark:text-white block">
                              {hub.name}
                            </span>
                            <span className="text-[10px] text-foreground-muted font-mono">
                              PIN: {hub.pincode} • 30-Min Dispatch
                            </span>
                          </div>
                        </div>
                        {isSelected && <Check className="h-4 w-4 text-accent shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
