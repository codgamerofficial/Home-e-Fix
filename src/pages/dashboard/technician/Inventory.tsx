import { useState } from "react";
import { Package, Plus, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const MOCK_INVENTORY = [
  { id: "inv-1", name: "Split AC Dual Capacitor 45uF", category: "AC Spares", stock: 6, unitPrice: 350 },
  { id: "inv-2", name: "R32 Eco Refrigerant Can (1kg)", category: "AC Spares", stock: 2, unitPrice: 1200 },
  { id: "inv-3", name: "Brass Basin Tap Spout Cartridge", category: "Plumbing", stock: 12, unitPrice: 120 },
  { id: "inv-4", name: "Single Pole 32A MCB Breaker", category: "Electrical", stock: 8, unitPrice: 220 },
];

export default function Inventory() {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [partName, setPartName] = useState("");
  const [quantity, setQuantity] = useState("5");

  const handleRequestStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (partName) {
      setShowRequestModal(false);
      setPartName("");
      alert(`Stock replenishment request for ${quantity}x '${partName}' submitted to Central Hub!`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-primary">Spare Parts Inventory</h1>
          <p className="text-xs text-foreground-secondary mt-1">
            Track certified spare parts carried in your toolkit and request hub stock
          </p>
        </div>

        <Button
          variant="accent"
          size="sm"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setShowRequestModal(true)}
        >
          Request Hub Stock
        </Button>
      </div>

      {showRequestModal && (
        <Card className="p-6 border border-accent/30 bg-accent/5 space-y-4 max-w-md">
          <h4 className="font-heading text-sm font-bold text-primary">Request Warehouse Replenishment</h4>
          <form onSubmit={handleRequestStock} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-foreground-secondary mb-1 block">Part Name / Item</label>
              <Input
                value={partName}
                onChange={(e) => setPartName(e.target.value)}
                placeholder="e.g. Copper Pipe Coil 1/2 inch"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground-secondary mb-1 block">Quantity Needed</label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setShowRequestModal(false)}>
                Cancel
              </Button>
              <Button variant="accent" size="sm" type="submit">
                Submit Request
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {MOCK_INVENTORY.map((item) => (
          <Card key={item.id} className="p-5 border border-border space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <Badge variant="secondary" className="mb-1 text-[10px]">{item.category}</Badge>
                <h4 className="font-heading text-sm font-bold text-primary">{item.name}</h4>
              </div>

              <div className="text-right">
                <span className="font-heading text-base font-bold text-accent">x{item.stock}</span>
                <span className="text-[10px] text-foreground-muted block">In Toolkit</span>
              </div>
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-foreground-secondary">
              <span>Unit Price: ₹{item.unitPrice}</span>
              <Button variant="ghost" size="sm" onClick={() => alert(`Replenishment requested for ${item.name}`)}>
                Request More
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
