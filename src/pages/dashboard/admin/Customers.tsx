import { useState, useEffect } from "react";
import { Search, ShieldAlert, ShieldCheck, UserX, UserCheck, Mail, Phone, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { dbRepository } from "@/services/db/repository";
import { formatCurrency } from "@/lib/currency";

export default function Customers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const loadCustomers = () => {
    setCustomers(dbRepository.getCustomers());
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const toggleStatus = (id: string) => {
    dbRepository.toggleCustomerBlock(id);
    loadCustomers();
  };

  const filtered = customers.filter(
    (c) =>
      (c.name && c.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.phone && c.phone.includes(searchQuery))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-primary">Customer CRM</h1>
          <p className="text-xs text-foreground-secondary mt-1">
            Real customer accounts, verified lifetime order counts, spend analytics, and security controls
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-full sm:w-72">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, phone..."
              leftIcon={<Search className="h-4 w-4 text-foreground-muted" />}
            />
          </div>
          <Button variant="outline" size="sm" onClick={loadCustomers} className="h-9">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="border border-border overflow-hidden shadow-sm">
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-foreground-muted">
                    No customers found matching search criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((cust) => (
                  <tr key={cust.id} className="hover:bg-surface/50 transition-colors">
                    <td className="p-4 font-bold text-primary">
                      <div>{cust.name}</div>
                      <div className="text-[10px] text-foreground-muted font-normal">
                        Joined {cust.joinedDate || "2026"}
                      </div>
                    </td>
                    <td className="p-4 text-foreground-secondary">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-foreground-muted" />
                        {cust.email}
                      </div>
                      <div className="text-[11px] text-foreground-muted flex items-center gap-1 mt-0.5">
                        <Phone className="h-3 w-3 text-foreground-muted" />
                        {cust.phone}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-primary">{cust.orders} Bookings</td>
                    <td className="p-4 font-bold text-accent">{formatCurrency(cust.spend)}</td>
                    <td className="p-4">
                      <Badge
                        variant="outline"
                        className={
                          cust.status === "active"
                            ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                            : "text-rose-700 bg-rose-50 border-rose-200"
                        }
                      >
                        {cust.status === "active" ? "🟢 Active" : "🔴 Blocked"}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleStatus(cust.id)}
                        className={`h-7 text-xs ${
                          cust.status === "active"
                            ? "text-rose-600 border-rose-200 hover:bg-rose-50"
                            : "text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                        }`}
                      >
                        {cust.status === "active" ? "Block Account" : "Unblock Account"}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
