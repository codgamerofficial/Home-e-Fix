import { useState } from "react";
import { Search, RotateCcw, UserPlus, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";

const MASTER_BOOKINGS = [
  { id: "b-101", ref: "HEF-894102", service: "Split AC Foam Jet Wash", customer: "Priya Sharma", tech: "Suresh Reddy", amount: 528, status: "assigned" },
  { id: "b-102", ref: "HEF-710294", service: "Bathroom Tap Leakage Repair", customer: "Anand Verma", tech: "Mahesh Kumar", amount: 228, status: "completed" },
  { id: "b-103", ref: "HEF-659103", service: "Switchboard & MCB Repair", customer: "Vikram Malhotra", tech: "Unassigned", amount: 178, status: "pending" },
];

export default function Bookings() {
  const [bookings, setBookings] = useState(MASTER_BOOKINGS);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  const handleReassign = (id: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, tech: "Suresh Reddy", status: "assigned" } : b))
    );
    alert("Reassigned technician to Suresh Reddy!");
  };

  const handleRefund = (id: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "refunded" } : b))
    );
    alert("Initiated instant refund to customer's source account!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-primary">Master Booking Operations</h1>
        <p className="text-xs text-foreground-secondary mt-1">
          Control tower to reassign technicians, override status, and process instant refunds
        </p>
      </div>

      <Card className="border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface border-b border-border text-foreground-secondary font-heading font-semibold">
              <tr>
                <th className="p-4">Booking Ref</th>
                <th className="p-4">Service</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Assigned Tech</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-surface/50 transition-colors">
                  <td className="p-4 font-mono font-bold text-accent">{b.ref}</td>
                  <td className="p-4 font-bold text-primary">{b.service}</td>
                  <td className="p-4 text-foreground-secondary">{b.customer}</td>
                  <td className="p-4 font-semibold text-primary">{b.tech}</td>
                  <td className="p-4 font-bold text-primary">{formatCurrency(b.amount)}</td>
                  <td className="p-4">
                    <Badge variant="secondary" className="capitalize">
                      {b.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleReassign(b.id)}>
                        Reassign
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleRefund(b.id)} className="text-rose-600 border-rose-200">
                        Refund
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
