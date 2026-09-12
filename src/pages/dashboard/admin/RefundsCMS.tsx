import { useState, useEffect } from "react";
import { RotateCcw, Search, CheckCircle2, Clock, DollarSign, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { dbRepository } from "@/services/db/repository";
import { formatCurrency } from "@/lib/currency";

export default function RefundsCMS() {
  const [refunds, setRefunds] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const loadRefunds = () => {
    setRefunds(dbRepository.getRefunds());
  };

  useEffect(() => {
    loadRefunds();
  }, []);

  const filtered = refunds.filter(
    (rf) =>
      (rf.id && rf.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (rf.bookingId && rf.bookingId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (rf.customer && rf.customer.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (rf.reason && rf.reason.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Refunds & Reversals Queue</h1>
          <p className="text-sm text-foreground-secondary">
            Customer cancellation claims, disputed charges, and automated gateway refund ledger
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={loadRefunds} className="h-9 gap-1 text-xs">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Queue
        </Button>
      </div>

      <div className="w-full sm:w-80">
        <Input
          placeholder="Search by refund ID, booking ref, customer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<Search className="h-4 w-4 text-foreground-muted" />}
        />
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card className="p-8 text-center text-xs text-foreground-muted">
            No refund records found matching search query.
          </Card>
        ) : (
          filtered.map((rf) => (
            <div
              key={rf.id}
              className="rounded-2xl border border-border bg-surface p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-primary">{rf.id}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-semibold font-mono">
                    {rf.bookingId}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[11px] ${
                      rf.status === "COMPLETED"
                        ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                        : "text-amber-700 bg-amber-50 border-amber-200"
                    }`}
                  >
                    {rf.status}
                  </Badge>
                </div>
                <h4 className="text-sm font-semibold text-foreground">{rf.customer}</h4>
                <p className="text-xs text-foreground-muted">
                  Reason: {rf.reason} • {rf.date}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-base font-extrabold text-primary">
                  {formatCurrency(rf.amount)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => alert(`Audit ID: ${rf.id}\nBooking: ${rf.bookingId}\nAmount: ₹${rf.amount}\nStatus: ${rf.status}\nGateway Ref: PGW-REV-${Date.now().toString().slice(-6)}`)}
                >
                  View Audit Trail
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
