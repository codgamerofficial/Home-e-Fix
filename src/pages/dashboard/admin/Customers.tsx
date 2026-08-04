import { useState } from "react";
import { Search, ShieldAlert, ShieldCheck, UserX, UserCheck, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";

const MOCK_CUSTOMERS = [
  { id: "usr-1", name: "Priya Sharma", email: "priya@homeefix.com", phone: "+91 98765 43210", spend: 4250, orders: 8, status: "active" },
  { id: "usr-2", name: "Anand Verma", email: "anand@example.com", phone: "+91 98123 45678", spend: 1820, orders: 3, status: "active" },
  { id: "usr-3", name: "Rohan Kapoor", email: "rohan@example.com", phone: "+91 97111 22233", spend: 650, orders: 1, status: "blocked" },
];

export default function Customers() {
  const [customers, setCustomers] = useState(MOCK_CUSTOMERS);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleStatus = (id: string) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: c.status === "active" ? "blocked" : "active" } : c))
    );
  };

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-primary">Customer CRM</h1>
          <p className="text-xs text-foreground-secondary mt-1">
            Manage registered accounts, lifetime spend history, and security block status
          </p>
        </div>

        <div className="w-full sm:w-72">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, phone..."
            leftIcon={<Search className="h-4 w-4 text-foreground-muted" />}
          />
        </div>
      </div>

      <Card className="border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface border-b border-border text-foreground-secondary font-heading font-semibold">
              <tr>
                <th className="p-4">Customer Name</th>
                <th className="p-4">Contact Info</th>
                <th className="p-4">Total Orders</th>
                <th className="p-4">Lifetime Spend</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((cust) => (
                <tr key={cust.id} className="hover:bg-surface/50 transition-colors">
                  <td className="p-4 font-bold text-primary">{cust.name}</td>
                  <td className="p-4 text-foreground-secondary">
                    <div>{cust.email}</div>
                    <div className="text-[11px] text-foreground-muted">{cust.phone}</div>
                  </td>
                  <td className="p-4 font-bold text-primary">{cust.orders} Bookings</td>
                  <td className="p-4 font-bold text-accent">{formatCurrency(cust.spend)}</td>
                  <td className="p-4">
                    <Badge variant={cust.status === "active" ? "secondary" : "outline"} className={cust.status === "active" ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"}>
                      {cust.status === "active" ? "🟢 Active" : "🔴 Blocked"}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleStatus(cust.id)}
                      className={cust.status === "active" ? "text-rose-600 border-rose-200" : "text-emerald-600 border-emerald-200"}
                    >
                      {cust.status === "active" ? "Block Account" : "Unblock Account"}
                    </Button>
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
