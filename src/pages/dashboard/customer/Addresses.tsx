import { useState } from "react";
import { AddressCard } from "@/components/ui/address-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, MapPin, CheckCircle2, AlertCircle, RotateCcw } from "lucide-react";
import { useCustomerAddresses } from "@/hooks/useCustomerAddresses";
import type { Address } from "@/types/address.types";

export default function Addresses() {
  const {
    addresses,
    isLoading,
    isError,
    error,
    refetch,
    createAddress,
    isCreating,
    updateAddress,
    isUpdating,
    deleteAddress,
    isDeleting,
    setDefaultAddress,
  } = useCustomerAddresses();

  const [showModal, setShowModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "Home",
    type: "home",
    streetAddress: "",
    landmark: "",
    city: "Kolkata",
    state: "West Bengal",
    pincode: "700064",
  });

  const showToast = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 4000);
  };

  const handleOpenAdd = () => {
    setEditingAddressId(null);
    setFormData({
      title: "Home",
      type: "home",
      streetAddress: "",
      landmark: "",
      city: "Kolkata",
      state: "West Bengal",
      pincode: "700064",
    });
    setShowModal(true);
  };

  const handleOpenEdit = (addr: Partial<Address>) => {
    if (!addr.id) return;
    setEditingAddressId(addr.id);
    setFormData({
      title: addr.title || addr.label || "Home",
      type: (addr.type || "home").toLowerCase(),
      streetAddress: addr.streetAddress || addr.address_line_1 || "",
      landmark: addr.landmark || "",
      city: addr.city || "Kolkata",
      state: addr.state || "West Bengal",
      pincode: addr.pincode || "700064",
    });
    setShowModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.streetAddress.trim() || !formData.pincode.trim()) {
      return;
    }

    try {
      if (editingAddressId) {
        await updateAddress({
          id: editingAddressId,
          updates: {
            title: formData.title,
            label: formData.title,
            type: formData.type,
            streetAddress: formData.streetAddress,
            address_line_1: formData.streetAddress,
            landmark: formData.landmark,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
          },
        });
        showToast("Address updated successfully.");
      } else {
        await createAddress({
          title: formData.title,
          label: formData.title,
          type: formData.type,
          streetAddress: formData.streetAddress,
          address_line_1: formData.streetAddress,
          landmark: formData.landmark,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          is_default: addresses.length === 0,
          isDefault: addresses.length === 0,
        });
        showToast("New delivery address added.");
      }

      setShowModal(false);
    } catch (err: any) {
      showToast(err?.message || "Failed to save address. Please try again.");
    }
  };

  const handleSetDefault = async (addr: Partial<Address>) => {
    if (!addr.id) return;
    try {
      await setDefaultAddress(addr.id);
      showToast("Default delivery location updated.");
    } catch (err: any) {
      showToast(err?.message || "Failed to set default location.");
    }
  };

  const handleDelete = async (addr: Partial<Address>) => {
    if (!addr.id) return;
    try {
      await deleteAddress(addr.id);
      showToast("Address removed from your account.");
    } catch (err: any) {
      showToast(err?.message || "Failed to remove address.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-primary">Saved Addresses</h1>
          <p className="text-xs text-foreground-secondary mt-1">
            Manage your service locations for instant 1-tap booking in Kolkata & Greater Bengal
          </p>
        </div>

        <Button
          variant="accent"
          size="sm"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={handleOpenAdd}
          className="font-bold shadow-xs"
        >
          Add New Address
        </Button>
      </div>

      {notice && (
        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* ADD / EDIT ADDRESS MODAL */}
      {showModal && (
        <Card className="p-6 border border-accent/30 bg-surface space-y-4 shadow-md rounded-2xl">
          <div className="flex items-center justify-between">
            <h4 className="font-heading text-sm font-bold text-primary">
              {editingAddressId ? "Edit Service Address" : "Add Service Location"}
            </h4>
            <span className="text-[11px] text-foreground-muted">Kolkata Service Zone</span>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-foreground-secondary block mb-1">
                  Location Tag
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Home, Office, Parents"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-foreground-secondary block mb-1">
                  Pincode
                </label>
                <Input
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  placeholder="700064"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-foreground-secondary block mb-1">
                Flat / Building / Street Address
              </label>
              <Input
                value={formData.streetAddress}
                onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                placeholder="e.g. Flat 4B, Greenfield Heights, Salt Lake Sector 1"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-foreground-secondary block mb-1">
                  Landmark (Optional)
                </label>
                <Input
                  value={formData.landmark}
                  onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                  placeholder="Near City Centre 1"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-foreground-secondary block mb-1">
                  City & State
                </label>
                <Input
                  value={`${formData.city}, ${formData.state}`}
                  disabled
                  className="bg-muted/30"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="accent"
                size="sm"
                type="submit"
                disabled={isCreating || isUpdating}
                className="font-bold shadow-xs"
              >
                {editingAddressId ? "Update Address" : "Save Address"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* STATE 1: LOADING SKELETONS */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      )}

      {/* STATE 2: ERROR BOUNDARY / RETRY */}
      {!isLoading && isError && (
        <Card className="p-8 text-center border border-error/20 bg-error/5 space-y-3 rounded-2xl">
          <AlertCircle className="mx-auto h-8 w-8 text-error" />
          <h4 className="font-heading font-bold text-sm text-primary">
            Unable to load your saved addresses
          </h4>
          <p className="text-xs text-foreground-secondary max-w-sm mx-auto">
            {error?.message || "A network or synchronization error occurred. Please try again."}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
            className="font-semibold"
          >
            Retry Loading
          </Button>
        </Card>
      )}

      {/* STATE 3: ZERO ADDRESSES EMPTY STATE */}
      {!isLoading && !isError && addresses.length === 0 && (
        <Card className="p-12 text-center border border-dashed border-border bg-surface space-y-3 rounded-2xl">
          <MapPin className="mx-auto h-10 w-10 text-foreground-muted" />
          <h4 className="font-heading font-bold text-base text-primary">No addresses saved yet</h4>
          <p className="text-xs text-foreground-secondary max-w-sm mx-auto">
            Save your home or office address to speed up your checkout and unlock instant 1-tap bookings.
          </p>
          <Button
            variant="accent"
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={handleOpenAdd}
            className="font-bold shadow-xs mt-2"
          >
            Add Your First Address
          </Button>
        </Card>
      )}

      {/* STATE 4: AUTHORITATIVE ADDRESS LIST */}
      {!isLoading && !isError && addresses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <AddressCard
              key={addr.id}
              address={addr}
              selected={addr.is_default || addr.isDefault}
              onSelect={() => handleSetDefault(addr)}
              onEdit={() => handleOpenEdit(addr)}
              onDelete={() => handleDelete(addr)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
