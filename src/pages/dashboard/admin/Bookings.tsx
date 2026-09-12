import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Search,
  RotateCcw,
  UserPlus,
  RefreshCw,
  CheckCircle,
  XCircle,
  ExternalLink,
  DollarSign,
  AlertCircle,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { dbRepository } from "@/services/db/repository";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import { getStatusConfig } from "@/lib/status";
import { ROUTES } from "@/constants/routes";

export default function Bookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [professionals, setProfessionals] = useState<any[]>([]);

  // Reassign Modal
  const [reassignTarget, setReassignTarget] = useState<any | null>(null);
  const [selectedTechId, setSelectedTechId] = useState("");

  // Refund Modal
  const [refundTarget, setRefundTarget] = useState<any | null>(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");

  const [notificationMsg, setNotificationMsg] = useState("");

  const loadData = () => {
    setBookings(dbRepository.getBookings());
    setProfessionals(dbRepository.getProfessionals());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReassignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignTarget || !selectedTechId) return;

    const pro = professionals.find((p) => p.id === selectedTechId);
    if (!pro) return;

    const updated = dbRepository.reassignBooking(
      reassignTarget.id,
      pro.id,
      pro.name,
      pro.phone
    );

    if (updated) {
      loadData();
      setReassignTarget(null);
      setSelectedTechId("");
      setNotificationMsg(`Booking ${reassignTarget.booking_number} reassigned to ${pro.name}.`);
      setTimeout(() => setNotificationMsg(""), 4000);
    }
  };

  const handleRefundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundTarget || !refundAmount) return;

    const amt = Number(refundAmount);
    const updated = dbRepository.refundBooking(
      refundTarget.id,
      amt,
      refundReason || "Customer cancellation / service dispute"
    );

    if (updated) {
      loadData();
      setRefundTarget(null);
      setRefundAmount("");
      setRefundReason("");
      setNotificationMsg(`Refund of ${formatCurrency(amt)} processed for ${refundTarget.booking_number}.`);
      setTimeout(() => setNotificationMsg(""), 4000);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      (b.booking_number && b.booking_number.toLowerCase().includes(q)) ||
      (b.service_name && b.service_name.toLowerCase().includes(q)) ||
      (b.customer_name && b.customer_name.toLowerCase().includes(q)) ||
      (b.technician_name && b.technician_name.toLowerCase().includes(q));

    if (!matchesQuery) return false;
    if (statusFilter === "ALL") return true;
    if (statusFilter === "ACTIVE") {
      return (
        b.status !== "COMPLETED" &&
        b.status !== "SERVICE_COMPLETED" &&
        b.status !== "CANCELLED" &&
        b.status !== "REFUNDED"
      );
    }
    if (statusFilter === "COMPLETED") {
      return b.status === "COMPLETED" || b.status === "SERVICE_COMPLETED";
    }
    if (statusFilter === "REFUNDED") return b.status === "REFUNDED";
    if (statusFilter === "CANCELLED") return b.status === "CANCELLED";
    return b.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-primary">Master Booking Operations</h1>
          <p className="text-xs text-foreground-secondary mt-1">
            Real-time control tower to reassign technicians, monitor status, and issue customer refunds
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData} className="text-xs gap-1">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh Live
          </Button>
        </div>
      </div>

      {notificationMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
          {notificationMsg}
        </div>
      )}

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ref, customer, pro, service..."
            leftIcon={<Search className="h-4 w-4 text-foreground-muted" />}
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto bg-muted p-1 rounded-xl border border-border text-xs">
          {["ALL", "ACTIVE", "COMPLETED", "REFUNDED", "CANCELLED"].map((f) => (
            <Button
              key={f}
              variant={statusFilter === f ? "accent" : "ghost"}
              size="sm"
              className="h-7 text-xs font-semibold"
              onClick={() => setStatusFilter(f)}
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      {/* MASTER BOOKINGS TABLE */}
      <Card className="border border-border overflow-hidden shadow-sm">
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
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-foreground-muted">
                    No bookings found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const statusConf = getStatusConfig(b.status);
                  const isCompletedOrRefunded =
                    b.status === "COMPLETED" ||
                    b.status === "SERVICE_COMPLETED" ||
                    b.status === "REFUNDED";

                  return (
                    <tr key={b.id} className="hover:bg-surface/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <Link
                            to={`/app/bookings/${b.id}`}
                            className="font-mono font-bold text-accent hover:underline flex items-center gap-1"
                          >
                            {b.booking_number || b.id}
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </div>
                        {b.is_dev_seed && (
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded border border-amber-300 text-amber-600 bg-amber-50 inline-block mt-0.5">
                            [DEV SEED]
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-bold text-primary max-w-50 truncate">
                        {b.service_name}
                      </td>
                      <td className="p-4 text-foreground-secondary">
                        <div className="font-semibold text-primary">{b.customer_name}</div>
                        <div className="text-[11px] text-foreground-muted">{b.customer_phone}</div>
                      </td>
                      <td className="p-4 font-semibold text-primary">
                        {b.technician_name ? (
                          <span>{b.technician_name}</span>
                        ) : (
                          <span className="text-foreground-muted italic">Unassigned</span>
                        )}
                      </td>
                      <td className="p-4 font-bold text-primary">
                        {formatCurrency(Number(b.total_amount) || 0)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusConf.badgeColor}`}
                        >
                          {statusConf.label}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          {!isCompletedOrRefunded && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => {
                                setReassignTarget(b);
                                setSelectedTechId(b.technician_id || "");
                              }}
                            >
                              Reassign
                            </Button>
                          )}
                          {b.status !== "REFUNDED" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setRefundTarget(b);
                                setRefundAmount(String(b.total_amount || 0));
                              }}
                              className="h-7 text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                            >
                              Refund
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* REASSIGN MODAL */}
      {reassignTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md p-6 space-y-4 shadow-2xl bg-surface border border-border">
            <h3 className="font-bold text-base text-primary">Reassign Technician</h3>
            <p className="text-xs text-foreground-secondary">
              Select an available verified tradesman to take over booking{" "}
              <span className="font-mono font-bold text-primary">
                {reassignTarget.booking_number}
              </span>
              .
            </p>

            <form onSubmit={handleReassignSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-foreground-secondary block mb-1">
                  Select Active Professional
                </label>
                <select
                  value={selectedTechId}
                  onChange={(e) => setSelectedTechId(e.target.value)}
                  className="w-full h-9 rounded-lg border border-border bg-surface px-3 text-xs"
                  required
                >
                  <option value="">-- Choose Technician --</option>
                  {professionals
                    .filter((p) => p.kycStatus === "APPROVED")
                    .map((pro) => (
                      <option key={pro.id} value={pro.id}>
                        {pro.name} ({pro.category}) - ★{pro.rating || "New"}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setReassignTarget(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="accent" size="sm" className="font-bold">
                  Confirm Reassignment
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* REFUND MODAL */}
      {refundTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md p-6 space-y-4 shadow-2xl bg-surface border border-border">
            <h3 className="font-bold text-base text-primary">Process Customer Refund</h3>
            <p className="text-xs text-foreground-secondary">
              Issue an instant reversal to customer for booking{" "}
              <span className="font-mono font-bold text-primary">
                {refundTarget.booking_number}
              </span>
              .
            </p>

            <form onSubmit={handleRefundSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-foreground-secondary block mb-1">
                  Refund Amount (₹)
                </label>
                <Input
                  type="number"
                  min="1"
                  max={refundTarget.total_amount}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-foreground-secondary block mb-1">
                  Refund Reason
                </label>
                <Input
                  placeholder="e.g. Technician delayed / customer dissatisfied"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRefundTarget(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="accent"
                  size="sm"
                  className="font-bold bg-rose-600 hover:bg-rose-700 text-white"
                >
                  Execute Refund
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
