import { useState } from "react";
import { AddressCard } from "@/components/ui/address-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

const INITIAL_ADDRESSES: any[] = [
  {
    id: "addr-1",
    title: "Home Address",
    type: "home",
    streetAddress: "Flat 402, Rainbow Vistas Rock Gardens",
    landmark: "Near Hitech City Flyover",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "500081",
    isDefault: true,
  },
  {
    id: "addr-2",
    title: "Work Office",
    type: "work",
    streetAddress: "Building 12B, Mindspace IT Park",
    landmark: "Madhapur",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "500081",
    isDefault: false,
  },
];

export default function Addresses() {
  const [addresses, setAddresses] = useState<any[]>(INITIAL_ADDRESSES);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAddr, setNewAddr] = useState({
    title: "Home Address",
    type: "home",
    streetAddress: "",
    landmark: "",
    city: "Hyderabad",
    pincode: "",
  });

  const handleSetDefault = (id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }))
    );
  };

  const handleDelete = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.streetAddress || !newAddr.pincode) return;

    const item: any = {
      id: `addr-${Date.now()}`,
      title: newAddr.title,
      type: newAddr.type,
      streetAddress: newAddr.streetAddress,
      landmark: newAddr.landmark,
      city: newAddr.city,
      state: "Telangana",
      pincode: newAddr.pincode,
      isDefault: addresses.length === 0,
    };

    setAddresses((prev) => [...prev, item]);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-primary">Saved Addresses</h1>
          <p className="text-xs text-foreground-secondary mt-1">
            Manage your service locations for quick 1-tap booking
          </p>
        </div>

        <Button
          variant="accent"
          size="sm"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setShowAddModal(true)}
        >
          Add New Address
        </Button>
      </div>

      {/* ADD ADDRESS MODAL FORM */}
      {showAddModal && (
        <Card className="p-6 border border-accent/30 bg-accent/5 space-y-4">
          <h4 className="font-heading text-sm font-bold text-primary">Enter New Address</h4>
          <form onSubmit={handleAddSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-foreground-secondary">Label</label>
                <Input
                  value={newAddr.title}
                  onChange={(e) => setNewAddr({ ...newAddr, title: e.target.value })}
                  placeholder="Home, Office"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-foreground-secondary">Pincode</label>
                <Input
                  value={newAddr.pincode}
                  onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                  placeholder="500081"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-foreground-secondary">Flat / Street</label>
              <Input
                value={newAddr.streetAddress}
                onChange={(e) => setNewAddr({ ...newAddr, streetAddress: e.target.value })}
                placeholder="Flat 102, Green Valley Apartments"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button variant="accent" size="sm" type="submit">
                Save Address
              </Button>
            </div>
          </form>
        </Card>
      )}

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
    </div>
  );
}
