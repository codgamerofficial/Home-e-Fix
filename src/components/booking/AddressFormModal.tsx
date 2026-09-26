import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MapPin,
  Home,
  Briefcase,
  Crosshair,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  addressFormSchema,
  type AddressFormValues,
} from "@/lib/validations/address.schema";
import { useCustomerAddresses } from "@/hooks/useCustomerAddresses";
import { geolocationService } from "@/services/location/geolocationService";
import { geocodingService } from "@/services/location/geocodingService";
import type { Address } from "@/types/address.types";

interface AddressFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<Address> | null;
  onSuccess?: (savedAddress: Address) => void;
  defaultFullName?: string;
  defaultPhone?: string;
}

const POPULAR_KOLKATA_LOCALITIES = [
  { name: "Salt Lake (Sector V)", pin: "700091" },
  { name: "Salt Lake (Sec 1-3)", pin: "700064" },
  { name: "New Town (Action Area 1)", pin: "700156" },
  { name: "Ballygunge", pin: "700019" },
  { name: "Behala", pin: "700034" },
  { name: "Jadavpur", pin: "700032" },
  { name: "Park Street", pin: "700016" },
  { name: "Dum Dum", pin: "700028" },
  { name: "Garia", pin: "700084" },
];

export const AddressFormModal: React.FC<AddressFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSuccess,
  defaultFullName = "",
  defaultPhone = "",
}) => {
  const { createAddress, updateAddress, isCreating, isUpdating } = useCustomerAddresses();
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [geoStatus, setGeoStatus] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const isEditing = Boolean(initialData?.id);
  const isSaving = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      fullName: initialData?.full_name || initialData?.recipient_name || defaultFullName || "",
      phone: initialData?.phone || initialData?.recipient_phone || defaultPhone || "",
      houseFlat: initialData?.house_flat || initialData?.streetAddress || "",
      building: initialData?.building || "",
      street: initialData?.street || initialData?.streetAddress || "",
      areaLocality: initialData?.area || initialData?.locality || "",
      landmark: initialData?.landmark || "",
      city: initialData?.city || "Kolkata",
      state: initialData?.state || "West Bengal",
      pincode: initialData?.postal_code || initialData?.pincode || "700091",
      addressType: (initialData?.label?.toUpperCase() || "HOME") as "HOME" | "WORK" | "OTHER",
      isDefault: Boolean(initialData?.is_default ?? initialData?.isDefault ?? false),
    },
  });

  const selectedType = watch("addressType");
  const selectedPincode = watch("pincode");

  useEffect(() => {
    if (isOpen) {
      setSubmissionError(null);
      setGeoStatus(null);
      reset({
        fullName: initialData?.full_name || initialData?.recipient_name || defaultFullName || "",
        phone: initialData?.phone || initialData?.recipient_phone || defaultPhone || "",
        houseFlat: initialData?.house_flat || initialData?.streetAddress || "",
        building: initialData?.building || "",
        street: initialData?.street || initialData?.streetAddress || "",
        areaLocality: initialData?.area || initialData?.locality || "",
        landmark: initialData?.landmark || "",
        city: initialData?.city || "Kolkata",
        state: initialData?.state || "West Bengal",
        pincode: initialData?.postal_code || initialData?.pincode || "700091",
        addressType: (initialData?.label?.toUpperCase() || "HOME") as "HOME" | "WORK" | "OTHER",
        isDefault: Boolean(initialData?.is_default ?? initialData?.isDefault ?? false),
      });
    }
  }, [isOpen, initialData, defaultFullName, defaultPhone, reset]);

  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    setGeoStatus("Detecting device GPS coordinates...");

    try {
      const coords = await geolocationService.getCurrentCoordinates({
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 15000,
      });

      setValue("latitude", coords.latitude);
      setValue("longitude", coords.longitude);

      setGeoStatus("Reverse geocoding address...");
      const geocoded = await geocodingService.reverseGeocode(
        coords.latitude,
        coords.longitude,
        coords.accuracy
      );

      if (geocoded.houseNumber) {
        setValue("houseFlat", geocoded.houseNumber);
      }
      if (geocoded.road) {
        setValue("street", geocoded.road);
      }
      if (geocoded.locality) {
        setValue("areaLocality", geocoded.locality);
      }
      if (geocoded.city) {
        setValue("city", geocoded.city);
      }
      if (geocoded.state) {
        setValue("state", geocoded.state);
      }
      if (geocoded.pincode) {
        setValue("pincode", geocoded.pincode);
      }

      const accuracyNotice = coords.accuracy
        ? ` (~${Math.round(coords.accuracy)}m accuracy)`
        : "";

      setGeoStatus(
        `Address detected${accuracyNotice}: ${geocoded.locality || geocoded.city}. Please confirm or edit details.`
      );
    } catch (err: any) {
      const msg =
        err?.userFriendlyMessage ||
        err?.message ||
        "Could not detect location. Please enter your address manually.";
      setGeoStatus(msg);
    } finally {
      setIsLocating(false);
    }
  };

  const handleSelectLocality = (locality: { name: string; pin: string }) => {
    setValue("areaLocality", locality.name, { shouldValidate: true });
    setValue("pincode", locality.pin, { shouldValidate: true });
    setValue("city", "Kolkata", { shouldValidate: true });
    setValue("state", "West Bengal", { shouldValidate: true });
  };

  const onSubmit = async (values: AddressFormValues) => {
    setSubmissionError(null);
    try {
      let resultAddress: Address;

      if (isEditing && initialData?.id) {
        resultAddress = await updateAddress({
          id: initialData.id,
          updates: {
            label: values.addressType,
            title: values.addressType,
            type: values.addressType.toLowerCase(),
            full_name: values.fullName,
            recipient_name: values.fullName,
            phone: values.phone,
            recipient_phone: values.phone,
            house_flat: values.houseFlat,
            building: values.building || null,
            street: values.street,
            streetAddress: values.street,
            address_line_1: values.street,
            area: values.areaLocality,
            locality: values.areaLocality,
            landmark: values.landmark || null,
            city: values.city,
            state: values.state,
            postal_code: values.pincode,
            pincode: values.pincode,
            is_default: values.isDefault,
            isDefault: values.isDefault,
            latitude: values.latitude || null,
            longitude: values.longitude || null,
          },
        });
      } else {
        resultAddress = await createAddress({
          label: values.addressType,
          title: values.addressType,
          type: values.addressType.toLowerCase(),
          full_name: values.fullName,
          recipient_name: values.fullName,
          phone: values.phone,
          recipient_phone: values.phone,
          house_flat: values.houseFlat,
          building: values.building || null,
          street: values.street,
          streetAddress: values.street,
          address_line_1: values.street,
          area: values.areaLocality,
          locality: values.areaLocality,
          landmark: values.landmark || null,
          city: values.city,
          state: values.state,
          country: "India",
          postal_code: values.pincode,
          pincode: values.pincode,
          is_default: values.isDefault,
          isDefault: values.isDefault,
          latitude: values.latitude || null,
          longitude: values.longitude || null,
        });
      }

      if (onSuccess && resultAddress) {
        onSuccess(resultAddress);
      }
      onClose();
    } catch (err: any) {
      setSubmissionError(
        err?.message || "Unable to save this address right now. Please check details and try again."
      );
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
        {/* Backdrop click to dismiss */}
        <div className="absolute inset-0" onClick={onClose} />

        {/* Modal / Mobile Panel */}
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 26, stiffness: 300 }}
          className="relative w-full sm:max-w-xl max-h-[92vh] sm:max-h-[85vh] bg-surface text-foreground border-t sm:border border-border rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden pb-safe z-10"
        >
          {/* Mobile Drag Indicator */}
          <div className="flex justify-center pt-2.5 pb-1 sm:hidden">
            <div className="h-1.5 w-12 rounded-full bg-border" />
          </div>

          {/* Modal Header */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-border shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-accent/10 text-accent">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-heading text-base sm:text-lg font-bold text-primary">
                  {isEditing ? "Edit Service Address" : "Add Service Address"}
                </h3>
                <p className="text-[11px] sm:text-xs text-foreground-secondary">
                  Home-e-Fix currently serves all areas across Kolkata
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="min-touch-target p-1.5 rounded-full text-foreground-muted hover:text-primary hover:bg-muted/50 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form Scrollable Body */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4 text-xs"
          >
            {submissionError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-medium text-xs leading-relaxed">{submissionError}</span>
              </div>
            )}

            {/* Address Type Selection */}
            <div className="space-y-1.5">
              <label className="font-bold text-primary block">
                Address Type <span className="text-accent">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "HOME", label: "Home", icon: Home },
                  { id: "WORK", label: "Work", icon: Briefcase },
                  { id: "OTHER", label: "Other", icon: MapPin },
                ].map((type) => {
                  const Icon = type.icon;
                  const isSelected = selectedType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setValue("addressType", type.id as any, { shouldValidate: true })}
                      className={`min-touch-target py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all cursor-pointer ${
                        isSelected
                          ? "border-accent bg-accent/10 text-accent shadow-xs"
                          : "border-border bg-surface text-foreground-secondary hover:border-slate-300"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Kolkata Locality Chips */}
            <div className="space-y-1.5 bg-muted/20 p-3 rounded-2xl border border-border/60">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-primary flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-accent" />
                  Quick Select Kolkata Locality
                </label>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={isLocating}
                  className="text-[11px] font-bold text-accent hover:underline flex items-center gap-1 min-touch-target"
                >
                  {isLocating ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Crosshair className="h-3 w-3" />
                  )}
                  <span>Use GPS</span>
                </button>
              </div>

              {geoStatus && (
                <p className="text-[10px] text-foreground-secondary font-medium italic mt-0.5">
                  {geoStatus}
                </p>
              )}

              <div className="flex flex-wrap gap-1.5 pt-1">
                {POPULAR_KOLKATA_LOCALITIES.map((loc) => {
                  const isMatched = selectedPincode === loc.pin;
                  return (
                    <button
                      key={loc.pin + loc.name}
                      type="button"
                      onClick={() => handleSelectLocality(loc)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                        isMatched
                          ? "bg-accent text-white border-accent shadow-xs"
                          : "bg-surface text-foreground-secondary border-border hover:border-slate-300"
                      }`}
                    >
                      {loc.name} ({loc.pin})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Customer Name & Mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-primary block">
                  Full Name <span className="text-accent">*</span>
                </label>
                <Input
                  {...register("fullName")}
                  placeholder="e.g. Saswata Mukherjee"
                  className="h-10 bg-surface text-xs"
                />
                {errors.fullName && (
                  <p className="text-[11px] text-rose-600 font-medium">{errors.fullName.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-bold text-primary block">
                  Mobile Number <span className="text-accent">*</span>
                </label>
                <Input
                  {...register("phone")}
                  placeholder="e.g. 9830012345"
                  maxLength={10}
                  className="h-10 bg-surface text-xs font-mono"
                />
                {errors.phone && (
                  <p className="text-[11px] text-rose-600 font-medium">{errors.phone.message}</p>
                )}
              </div>
            </div>

            {/* House / Flat & Building */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-primary block">
                  House / Flat / Apartment <span className="text-accent">*</span>
                </label>
                <Input
                  {...register("houseFlat")}
                  placeholder="e.g. Flat 4B, 4th Floor"
                  className="h-10 bg-surface text-xs"
                />
                {errors.houseFlat && (
                  <p className="text-[11px] text-rose-600 font-medium">{errors.houseFlat.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-bold text-primary block">
                  Building / Society (Optional)
                </label>
                <Input
                  {...register("building")}
                  placeholder="e.g. Greenfield Heights"
                  className="h-10 bg-surface text-xs"
                />
              </div>
            </div>

            {/* Street / Road & Area / Locality */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-primary block">
                  Street / Road <span className="text-accent">*</span>
                </label>
                <Input
                  {...register("street")}
                  placeholder="e.g. Broadway Road, Street 104"
                  className="h-10 bg-surface text-xs"
                />
                {errors.street && (
                  <p className="text-[11px] text-rose-600 font-medium">{errors.street.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-bold text-primary block">
                  Area / Locality <span className="text-accent">*</span>
                </label>
                <Input
                  {...register("areaLocality")}
                  placeholder="e.g. Sector V / Salt Lake"
                  className="h-10 bg-surface text-xs"
                />
                {errors.areaLocality && (
                  <p className="text-[11px] text-rose-600 font-medium">{errors.areaLocality.message}</p>
                )}
              </div>
            </div>

            {/* Landmark, City, State, PIN Code */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-primary block">
                  Landmark (Optional)
                </label>
                <Input
                  {...register("landmark")}
                  placeholder="e.g. Near City Centre 1"
                  className="h-10 bg-surface text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-primary block">
                  PIN Code <span className="text-accent">*</span>
                </label>
                <Input
                  {...register("pincode")}
                  placeholder="700091"
                  maxLength={6}
                  className="h-10 bg-surface text-xs font-mono font-bold"
                />
                {errors.pincode && (
                  <p className="text-[11px] text-rose-600 font-medium">{errors.pincode.message}</p>
                )}
              </div>
            </div>

            {/* City & State (Kolkata-Wide Serviceability Guarantee) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-primary block">City</label>
                <Input
                  {...register("city")}
                  readOnly
                  className="h-10 bg-muted/40 text-xs font-semibold cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-primary block">State</label>
                <Input
                  {...register("state")}
                  readOnly
                  className="h-10 bg-muted/40 text-xs font-semibold cursor-not-allowed"
                />
              </div>
            </div>

            {/* Default Address Checkbox */}
            <div className="pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  {...register("isDefault")}
                  className="h-4 w-4 rounded border-border text-accent focus:ring-accent accent-[#FF6A00]"
                />
                <span className="font-semibold text-primary text-xs">
                  Set as my default service delivery address
                </span>
              </label>
            </div>

            {/* Sticky/Fixed Action Buttons */}
            <div className="flex gap-2.5 pt-3 border-t border-border mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSaving}
                className="w-1/3 min-touch-target font-semibold text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="accent"
                disabled={isSaving}
                className="w-2/3 min-touch-target font-bold text-xs bg-[#FF6A00] hover:bg-accent-dark text-white gap-1.5 shadow-md"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving Address...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{isEditing ? "Update Address" : "Save & Select Address"}</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
