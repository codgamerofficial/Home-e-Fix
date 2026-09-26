import { useState, useMemo, useEffect } from "react";
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
  Loader2,
  ShieldCheck,
  Edit3,
  ArrowLeft,
} from "lucide-react";
import { useLocationStore, type CurrentLocationState } from "@/store/location.store";
import { useAuthStore } from "@/store/auth.store";
import { dbRepository } from "@/services/db/repository";
import { geocodingService } from "@/services/location/geocodingService";
import { serviceAreaService } from "@/services/location/serviceAreaService";
import { OPERATIONAL_CITIES } from "@/constants/services";
import { Button } from "@/components/ui/button";
import type { GeocodeSearchResult } from "@/types/location.types";

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
  const {
    locality,
    pincode,
    status,
    isDetecting,
    error: geoStoreError,
    accuracyWarning,
    draftDetectedLocation,
    detectCurrentLocation,
    confirmDetectedLocation,
    cancelDetection,
    selectSavedAddress,
    setManualLocation,
  } = useLocationStore();

  const { user, isAuthenticated } = useAuthStore();

  // Search state
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GeocodeSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Edit / Confirmation fields for draft
  const [houseFlatInput, setHouseFlatInput] = useState("");
  const [streetInput, setStreetInput] = useState("");
  const [pincodeInput, setPincodeInput] = useState("");
  const [saveLabel, setSaveLabel] = useState<"HOME" | "WORK" | "OTHER" | "NONE">("NONE");
  const [pincodeError, setPincodeError] = useState<string | null>(null);

  // Real saved addresses for current authenticated user
  const savedAddresses = useMemo(() => {
    if (!isAuthenticated || !user?.id) return [];
    return dbRepository.getAddresses(user.id);
  }, [isAuthenticated, user?.id]);

  // Operational hubs reference
  const operationalHubs = OPERATIONAL_CITIES.activeHubs || [];

  // Initialize editable fields whenever draft detected location is populated
  useEffect(() => {
    if (draftDetectedLocation) {
      setHouseFlatInput(draftDetectedLocation.houseFlat || "");
      setStreetInput(draftDetectedLocation.street || "");
      setPincodeInput(draftDetectedLocation.pincode || "");
      setPincodeError(null);
    }
  }, [draftDetectedLocation]);

  // Debounced search for locations via Nominatim forward geocoding
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await geocodingService.searchAddresses(query);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle GPS acquisition click
  const handleUseCurrentLocation = async () => {
    try {
      await detectCurrentLocation();
    } catch {
      // Error is set in store and rendered cleanly
    }
  };

  // Handle selection of a forward-geocoded search result
  const handleSelectSearchResult = (result: GeocodeSearchResult) => {
    const serviceCheck = serviceAreaService.validateServiceArea({
      latitude: result.latitude,
      longitude: result.longitude,
      city: result.city,
      locality: result.locality,
      pincode: result.pincode,
    });

    const draft: CurrentLocationState = {
      latitude: result.latitude,
      longitude: result.longitude,
      accuracy: 25,
      houseFlat: "",
      street: result.rawAddress?.road || "",
      locality: result.locality || result.city,
      city: result.city || "Kolkata",
      state: result.state || "West Bengal",
      pincode: result.pincode || "",
      country: result.country || "India",
      source: "search",
      confirmed: false,
      timestamp: Date.now(),
      formattedAddress: result.displayName,
      serviceability: serviceCheck,
    };

    useLocationStore.setState({
      draftDetectedLocation: draft,
      status: "awaiting_confirmation",
      isDetecting: false,
      error: null,
    });
  };

  // Handle user confirming the detected location
  const handleConfirmLocation = async () => {
    // Validate PIN code format if entered
    if (pincodeInput) {
      const clean = pincodeInput.replace(/\D/g, "");
      if (!/^[1-9][0-9]{5}$/.test(clean)) {
        setPincodeError("Please enter a valid 6-digit PIN code.");
        return;
      }
    }

    const customDetails: Partial<CurrentLocationState> = {
      houseFlat: houseFlatInput.trim() || undefined,
      street: streetInput.trim() || undefined,
      pincode: pincodeInput.trim(),
    };

    await confirmDetectedLocation({
      customDetails,
      saveLabel: saveLabel !== "NONE" ? saveLabel : undefined,
      userId: user?.id,
      fullName: user?.fullName,
      phone: user?.phone,
    });

    onClose();
  };

  // Handle direct hub selection
  const handleSelectHub = (hub: (typeof operationalHubs)[0]) => {
    setManualLocation(hub.name, hub.pincode, `${hub.name}, Kolkata - ${hub.pincode}`, {
      city: "Kolkata",
    });
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
          className="w-full max-h-[88vh] rounded-t-3xl border-t border-border bg-surface text-foreground shadow-2xl flex flex-col overflow-hidden pb-safe"
        >
          {/* Grab Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="h-1.5 w-12 rounded-full bg-border" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              {draftDetectedLocation && (
                <button
                  type="button"
                  onClick={cancelDetection}
                  className="p-1 rounded-full text-foreground-muted hover:text-foreground hover:bg-muted transition-colors mr-1"
                  aria-label="Back to location list"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}
              <div>
                <h3 className="font-heading text-base font-bold text-primary dark:text-white">
                  {draftDetectedLocation
                    ? "Confirm Service Location"
                    : "Where should we send your professional?"}
                </h3>
                <p className="text-xs text-foreground-secondary">
                  {draftDetectedLocation
                    ? "Verify your address details before confirming"
                    : "Find services available near you"}
                </p>
              </div>
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

          {/* ─────────────────────────────────────────────────────────────
              VIEW A: CONFIRMATION VIEW (Awaiting user confirmation of detected/searched location)
             ───────────────────────────────────────────────────────────── */}
          {draftDetectedLocation ? (
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Location Detected Banner */}
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-accent/10 border border-accent/30 text-accent-foreground">
                <MapPin className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <div className="flex-1 text-xs">
                  <div className="flex items-center gap-2 font-bold text-primary dark:text-white text-sm">
                    <span>Location Detected</span>
                    {draftDetectedLocation.accuracy && (
                      <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-surface border border-border text-foreground-muted">
                        ~{Math.round(draftDetectedLocation.accuracy)}m accuracy
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-foreground-muted">
                    {draftDetectedLocation.formattedAddress}
                  </p>
                  {accuracyWarning && (
                    <p className="mt-1.5 text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      {accuracyWarning}
                    </p>
                  )}
                </div>
              </div>

              {/* Service Territory Status Check */}
              {draftDetectedLocation.serviceability && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
                    draftDetectedLocation.serviceability.isServiceable
                      ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300"
                      : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300"
                  }`}
                >
                  {draftDetectedLocation.serviceability.isServiceable ? (
                    <>
                      <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>{draftDetectedLocation.serviceability.message}</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                      <span>{draftDetectedLocation.serviceability.reason || "Home-e-Fix isn't available in this area yet."}</span>
                    </>
                  )}
                </div>
              )}

              {/* Address Verification / Completion Form */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
                  Confirm or Complete Address Details
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-foreground-muted mb-1">
                      House / Flat / Floor No.
                    </label>
                    <input
                      type="text"
                      value={houseFlatInput}
                      onChange={(e) => setHouseFlatInput(e.target.value)}
                      placeholder="e.g. Flat 4B, Tower 2"
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-foreground-muted focus:border-accent focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground-muted mb-1">
                      Street / Building / Area
                    </label>
                    <input
                      type="text"
                      value={streetInput}
                      onChange={(e) => setStreetInput(e.target.value)}
                      placeholder="e.g. Sector V / Ring Road"
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-foreground-muted focus:border-accent focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground-muted mb-1">
                      Locality & City
                    </label>
                    <input
                      type="text"
                      disabled
                      value={`${draftDetectedLocation.locality}, ${draftDetectedLocation.city}`}
                      className="w-full rounded-xl border border-border bg-muted/60 px-3 py-2 text-xs text-foreground-muted cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground-muted mb-1">
                      6-Digit PIN Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={pincodeInput}
                      onChange={(e) => {
                        setPincodeInput(e.target.value.replace(/\D/g, "").slice(0, 6));
                        setPincodeError(null);
                      }}
                      placeholder="e.g. 700091"
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground font-mono placeholder:text-foreground-muted focus:border-accent focus:outline-hidden"
                    />
                    {pincodeError && (
                      <p className="text-[11px] text-rose-600 mt-1">{pincodeError}</p>
                    )}
                  </div>
                </div>

                {/* Optional Save Address Toggle for Authenticated Users */}
                {isAuthenticated && (
                  <div className="pt-2">
                    <span className="block text-xs font-medium text-foreground-muted mb-1.5">
                      Save this address for future bookings?
                    </span>
                    <div className="flex gap-2">
                      {(["NONE", "HOME", "WORK", "OTHER"] as const).map((lbl) => (
                        <button
                          key={lbl}
                          type="button"
                          onClick={() => setSaveLabel(lbl)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                            saveLabel === lbl
                              ? "bg-accent text-white border-accent shadow-xs"
                              : "border-border text-foreground-muted hover:bg-muted"
                          }`}
                        >
                          {lbl === "NONE" ? "Don't Save" : lbl}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={cancelDetection}
                  className="flex-1 font-semibold rounded-xl text-xs py-2.5"
                >
                  Change Location
                </Button>

                <Button
                  type="button"
                  onClick={handleConfirmLocation}
                  disabled={
                    draftDetectedLocation.serviceability &&
                    !draftDetectedLocation.serviceability.isServiceable
                  }
                  className="flex-1 font-bold rounded-xl text-xs py-2.5 bg-accent hover:bg-accent/90 text-white"
                >
                  Confirm This Location
                </Button>
              </div>
            </div>
          ) : (
            /* ─────────────────────────────────────────────────────────────
                VIEW B: SELECTION VIEW (GPS button, search, saved addresses, operational hubs)
               ───────────────────────────────────────────────────────────── */
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* Search Box */}
              <div>
                <div className="relative flex items-center">
                  <Search className="absolute left-3.5 h-4 w-4 text-foreground-muted" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search address, locality or 6-digit PIN..."
                    className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-accent focus:outline-hidden"
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3.5 h-4 w-4 text-accent animate-spin" />
                  )}
                  {query && !isSearching && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="absolute right-3 text-xs text-foreground-muted hover:text-foreground p-1"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Search Results Dropdown List */}
                {searchResults.length > 0 && (
                  <div className="mt-2 border border-border rounded-xl bg-surface divide-y divide-border overflow-hidden shadow-lg">
                    {searchResults.map((res) => (
                      <button
                        key={res.placeId}
                        type="button"
                        onClick={() => handleSelectSearchResult(res)}
                        className="w-full p-3 text-left hover:bg-muted transition-colors flex items-start gap-2.5 cursor-pointer"
                      >
                        <MapPin className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-xs text-primary dark:text-white block">
                            {res.locality || res.city}
                          </span>
                          <span className="text-[11px] text-foreground-muted line-clamp-1">
                            {res.displayName}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Real GPS Location Button */}
              <div>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={isDetecting}
                  className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl border border-accent/40 bg-accent/5 hover:bg-accent/10 transition-colors text-left group min-touch-target cursor-pointer"
                >
                  <div className="h-10 w-10 rounded-xl bg-accent text-white flex items-center justify-center shrink-0 shadow-sm shadow-orange-500/30">
                    <Navigation className={`h-5 w-5 ${isDetecting ? "animate-spin" : ""}`} />
                  </div>
                  <div className="flex-1">
                    <span className="font-bold text-xs sm:text-sm text-primary dark:text-white block group-hover:text-accent transition-colors">
                      {status === "detecting"
                        ? "Detecting your location..."
                        : status === "reverse_geocoding"
                        ? "Getting your address..."
                        : "Use my current location"}
                    </span>
                    <span className="text-[11px] text-foreground-muted block">
                      Detect your address automatically
                    </span>
                  </div>
                </button>

                {geoStoreError && (
                  <div className="mt-2 flex items-center justify-between text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{geoStoreError}</span>
                    </div>
                    {onAddNewAddress && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onAddNewAddress();
                        }}
                        className="text-[11px] font-bold text-rose-700 underline shrink-0 ml-2"
                      >
                        Enter Manually
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Manual Entry Quick Action */}
              {onAddNewAddress && (
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onAddNewAddress();
                    }}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-border hover:border-accent text-foreground-muted hover:text-accent text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Enter address manually</span>
                  </button>
                </div>
              )}

              {/* Saved Addresses Section (Only real addresses for authenticated user) */}
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
                          onClick={() => {
                            selectSavedAddress(addr);
                            onClose();
                          }}
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

              {/* Operational Hubs Quick Selection */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
                  Popular Kolkata Service Hubs
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {operationalHubs.slice(0, 6).map((hub) => {
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
                          <MapPin
                            className={`h-4 w-4 shrink-0 ${
                              isSelected ? "text-accent" : "text-foreground-muted"
                            }`}
                          />
                          <div>
                            <span className="font-semibold text-xs text-primary dark:text-white block">
                              {hub.name}
                            </span>
                            <span className="text-[10px] text-foreground-muted font-mono">
                              PIN: {hub.pincode}
                            </span>
                          </div>
                        </div>
                        {isSelected && <Check className="h-4 w-4 text-accent shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
