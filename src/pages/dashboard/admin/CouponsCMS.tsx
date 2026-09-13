import { useState, useEffect } from "react";
import { Plus, Tag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { dbRepository } from "@/services/db/repository";
import { formatCurrency } from "@/lib/currency";

export default function CouponsCMS() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDiscount, setNewDiscount] = useState("150");

  useEffect(() => {
    const allCoupons = dbRepository.getCoupons();
    const bookings = dbRepository.getBookings();
    
    // Calculate actual redemption count from real database bookings
    const formatted = allCoupons.map((c) => {
      const realRedemptions = bookings.filter(
        (b) => b.coupon_code && b.coupon_code.toUpperCase() === c.code.toUpperCase()
      ).length;
      return {
        ...c,
        uses: realRedemptions,
      };
    });
    setCoupons(formatted);
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCode && newTitle) {
      setCoupons((prev) => [
        ...prev,
        {
          id: `c-${Date.now()}`,
          code: newCode.toUpperCase(),
          title: newTitle,
          discount: `₹${newDiscount} Fixed`,
          minOrder: 399,
          uses: 0,
        },
      ]);
      setShowModal(false);
      setNewCode("");
      setNewTitle("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-primary">Coupon & Promo Code CMS</h1>
          <p className="text-xs text-foreground-secondary mt-1">
            Create discount vouchers, set minimum order rules, and cap usage limits
          </p>
        </div>

        <Button variant="accent" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowModal(true)}>
          Create New Promo Code
        </Button>
      </div>

      {showModal && (
        <Card className="p-6 border border-accent/30 bg-accent/5 space-y-4 max-w-md">
          <h4 className="font-heading text-sm font-bold text-primary">Create New Promo Voucher</h4>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-foreground-secondary mb-1 block">Coupon Code</label>
              <Input value={newCode} onChange={(e) => setNewCode(e.target.value)} placeholder="e.g. MONSOON250" required />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground-secondary mb-1 block">Offer Title</label>
              <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g. Monsoon Special Discount" required />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button variant="accent" size="sm" type="submit">Create Coupon</Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="border border-border overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-surface border-b border-border font-heading font-semibold text-foreground-secondary">
            <tr>
              <th className="p-4">Coupon Code</th>
              <th className="p-4">Title</th>
              <th className="p-4">Discount</th>
              <th className="p-4">Min Order</th>
              <th className="p-4">Total Uses</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {coupons.map((c) => (
              <tr key={c.id}>
                <td className="p-4 font-mono font-bold text-accent">{c.code}</td>
                <td className="p-4 font-bold text-primary">{c.title}</td>
                <td className="p-4">{c.discount}</td>
                <td className="p-4">₹{c.minOrder}</td>
                <td className="p-4 font-bold text-primary">{c.uses} redeemed</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
