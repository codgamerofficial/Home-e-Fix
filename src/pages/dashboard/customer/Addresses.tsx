import { useState, useEffect } from "react";
import { AddressCard } from "@/components/ui/address-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, MapPin, CheckCircle2 } from "lucide-react";
import { dbRepository } from "@/services/db/repository";

export default function Addresses() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [newAddr, setNewAddr] = useState({
    title: "Home",
    type: "home",
    streetAddress: "",
    landmark: "",
    city: "Kolkata",
    state: "West Bengal",
    pincode: "700064",
  });

  const loadAddresses = () => {
    setAddresses(dbRepository.getAddresses());
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleSetDefault = (id: string) => {
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    setAddresses(updated);
    localStorage.setItem("homeefix_db_v2_addresses", JSON.stringify(updated));
    setNotice("Default delivery location updated.");
    setTimeout(() => setNotice(null), 4000);
  };

  const handleDelete = (id: string) => {
    const updated = dbRepository.deleteAddress(id);
    setAddresses(updated);
    setNotice("Address removed.");
    setTimeout(() => setNotice(null), 4000);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.streetAddress || !newAddr.pincode) return;

    const item: any = {
      title: newAddr.title,
      type: newAddr.type,
      streetAddress: newAddr.streetAddress,
      landmark: newAddr.landmark,
      city: newAddr.city,
      state: newAddr.state,
      pincode: newAddr.pincode,
      isDefault: addresses.length === 0,
    };

    const updated = dbRepository.saveAddress(item);
    setAddresses(updated);
    setShowAddModal(false);
    setNewAddr({
      title: "Home",
      type: "home",
      streetAddress: "",
      landmark: "",
      city: "Kolkata",
      state: "West Bengal",
      pincode: "700064",
    });
    setNotice("New address saved successfully.");
    setTimeout(() => setNotice(null), 4000);
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
          onClick={() => setShowAddModal(true)}
          className="font-bold shadow-xs"
        >
          Add New Address
        </Button>
      </div>

      {notice && (
        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{notice}</span>
        </div>
      )}

      {/* ADD ADDRESS MODAL FORM */}
      {showAddModal && (
        <Card className="p-6 border border-accent/30 bg-surface space-y-4 shadow-md">
          <h4 className="font-heading text-sm font-bold text-primary">Add Service Location</h4>
          <form onSubmit={handleAddSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-foreground-secondary block mb-1">Label</label>
                <Input
                  value={newAddr.title}
                  onChange={(e) => setNewAddr({ ...newAddr, title: e.target.value })}
                  placeholder="e.g. Home, Office, Parents"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-foreground-secondary block mb-1">Pincode</label>
                <Input
                  value={newAddr.pincode}
                  onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                  placeholder="700064"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-foreground-secondary block mb-1">Flat / Building / Street</label>
              <Input
                value={newAddr.streetAddress}
                onChange={(e) => setNewAddr({ ...newAddr, streetAddress: e.target.value })}
                placeholder="e.g. Flat 4B, Greenfield Heights, Salt Lake Sector 1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-foreground-secondary block mb-1">Landmark</label>
                <Input
                  value={newAddr.landmark}
                  onChange={(e) => setNewAddr({ ...newAddr, landmark: e.target.value })}
                  placeholder="Near City Centre 1"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-foreground-secondary block mb-1">City</label>
                <Input
                  value={newAddr.city}
                  onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                  placeholder="Kolkata"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="ghost" size="sm" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button variant="accent" size="sm" type="submit" className="font-bold">
                Save Address
              </Button>
            </div>
          </form>
        </Card>
      )}

      {addresses.length === 0 ? (
        <Card className="p-12 text-center border border-dashed border-border bg-surface space-y-2">
          <MapPin className="mx-auto h-8 w-8 text-foreground-muted" />
          <h4 className="font-heading font-bold text-sm text-primary">No addresses saved yet</h4>
          <p className="text-xs text-foreground-secondary">
            Save your home or office address to speed up your checkout.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <AddressCard
              key={addr.id}
              address={addr}
              selected={addr.isDefault}
              onSelect={() => handleSetDefault(addr.id)}
              onDelete={() => handleDelete(addr.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
