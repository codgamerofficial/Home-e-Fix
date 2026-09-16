import { useState } from "react";
import { AddressCard } from "@/components/ui/address-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, MapPin, CheckCircle2, AlertCircle, RotateCcw } from "lucide-react";
import { useCustomerAddresses } from "@/hooks/useCustomerAddresses";
import { AddressFormModal } from "@/components/booking/AddressFormModal";
import type { Address } from "@/types/address.types";

export default function Addresses() {
  const {
    addresses,
    isLoading,
    isError,
    error,
    refetch,
    deleteAddress,
    setDefaultAddress,
  } = useCustomerAddresses();

  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 4000);
  };

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setShowModal(true);
  };

  const handleOpenEdit = (addr: Address) => {
    setEditingAddress(addr);
    setShowModal(true);
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
            Manage your service delivery addresses across all areas in Kolkata
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

      {/* AUTHORITATIVE ADDRESS FORM MODAL */}
      <AddressFormModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingAddress(null);
        }}
        initialData={editingAddress}
        onSuccess={() => {
          showToast(editingAddress ? "Address updated successfully." : "New delivery address added.");
        }}
      />

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
            Save your home or office address in Kolkata to speed up checkout and unlock instant 1-tap bookings.
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
