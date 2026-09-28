import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  Activity,
  Radio,
  MapPin,
  Clock,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  RefreshCw,
  Phone,
  ExternalLink,
  Car,
  UserPlus,
  Users,
  Search,
  Filter,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { dbRepository } from "@/services/db/repository";
import { professionalService } from "@/services/professional/professionalService";
import { subscribeToBookingSync } from "@/services/realtime/sync";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/date";

export default function LiveOperations() {
  const [activeTab, setActiveTab] = useState<"queue" | "transit" | "active">("queue");
  const [bookings, setBookings] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationMsg, setNotificationMsg] = useState("");

  // Manual Dispatch Modal
  const [assignTarget, setAssignTarget] = useState<any | null>(null);
  const [selectedProId, setSelectedProId] = useState("");
  const [assignmentNote, setAssignmentNote] = useState("");

  const loadData = () => {
    const all = dbRepository.getBookings();
    setBookings(all);
    const pros = dbRepository.getProfessionals();
    setProfessionals(pros);
  };

  useEffect(() => {
    loadData();

    // Subscribe to multi-transport real-time booking changes (Customer, Tech & Admin)
    const unsubscribe = subscribeToBookingSync("*", () => {
      loadData();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // 1. Assignment Queue: Bookings awaiting professional assignment
  const assignmentQueue = bookings.filter((b) => {
    const st = (b.status || "").toUpperCase();
    const hasAssignedTech = Boolean(b.technician_name && b.technician_id);
    return (
      (!hasAssignedTech || st === "CONFIRMED" || st === "ASSIGNMENT_PENDING" || st === "SEARCHING_PROFESSIONAL") &&
      st !== "CANCELLED" &&
      st !== "REFUNDED" &&
      st !== "COMPLETED" &&
      st !== "SERVICE_COMPLETED"
    );
  });

  // 2. Active Transit Sessions: Technicians en route or arrived
  const transitSessions = bookings.filter((b) => {
    const st = (b.status || "").toUpperCase();
    return st === "PROFESSIONAL_ON_THE_WAY" || st === "ON_THE_WAY" || st === "PROFESSIONAL_ARRIVED";
  });

  // 3. In Progress Services: Active repair work in progress
  const activeServices = bookings.filter((b) => {
    const st = (b.status || "").toUpperCase();
    return st === "SERVICE_STARTED" || st === "AWAITING_CUSTOMER_APPROVAL";
  });

  // Metric aggregates
  const todayBookingsCount = bookings.length;
  const queueCount = assignmentQueue.length;
  const transitCount = transitSessions.length;
  const inProgressCount = activeServices.length;
  const totalRevenue = bookings
    .filter((b) => b.payment_status === "PAID" || b.status === "COMPLETED" || b.status === "SERVICE_COMPLETED")
    .reduce((sum, b) => sum + (Number(b.total_amount) || 0), 0);

  // Dispatch Action
  const handleDispatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTarget || !selectedProId) return;

    const pro = professionals.find((p) => p.id === selectedProId);
    if (!pro) return;

    const updated = dbRepository.assignBookingToProfessional(
      assignTarget.id,
      pro.id,
      pro.name,
      pro.phone || "+91 98300 00000",
      "admin-dispatch"
    );

    if (updated) {
      loadData();
      setNotificationMsg(`Dispatched booking #${assignTarget.booking_number || assignTarget.id} to ${pro.name}! Realtime updates broadcast to customer & professional.`);
      setAssignTarget(null);
      setSelectedProId("");
      setAssignmentNote("");
      setTimeout(() => setNotificationMsg(""), 5000);
    }
  };

  // Filter queue by search
  const filteredQueue = assignmentQueue.filter((b) => {
    const q = searchQuery.toLowerCase();
    return (
      (b.booking_number && b.booking_number.toLowerCase().includes(q)) ||
      (b.service_name && b.service_name.toLowerCase().includes(q)) ||
      (b.customer_name && b.customer_name.toLowerCase().includes(q)) ||
      (typeof b.address === "string" && b.address.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-heading text-2xl font-extrabold text-primary">
              Live Operations & Dispatch Radar
            </h1>
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Realtime Active
            </Badge>
          </div>
          <p className="text-xs text-foreground-secondary mt-1">
            Realtime marketplace dispatch radar, assignment queue, and technician telemetry tracking.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => loadData()} className="gap-2 font-semibold">
          <RefreshCw className="w-4 h-4 text-accent" /> Refresh State
        </Button>
      </div>

      {/* ─── Notification Alert ─── */}
      {notificationMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between gap-2 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notificationMsg}</span>
          </div>
          <button onClick={() => setNotificationMsg("")} className="font-bold text-emerald-700 hover:text-emerald-950">
            ✕
          </button>
        </div>
      )}

      {/* ─── Realtime Metric Cards ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <Card className="p-4 bg-surface border border-border">
          <p className="text-[10px] text-foreground-muted font-bold uppercase tracking-wider">Total Bookings</p>
          <p className="text-2xl font-black text-primary mt-1 font-heading">{todayBookingsCount}</p>
          <span className="text-[10px] text-slate-500 font-medium">Database Records</span>
        </Card>

        <Card className="p-4 bg-surface border border-border border-l-4 border-l-amber-500">
          <p className="text-[10px] text-foreground-muted font-bold uppercase tracking-wider">Assignment Queue</p>
          <p className="text-2xl font-black text-amber-600 mt-1 font-heading">{queueCount}</p>
          <span className="text-[10px] text-amber-600 font-medium">Awaiting Dispatch</span>
        </Card>

        <Card className="p-4 bg-surface border border-border border-l-4 border-l-blue-500">
          <p className="text-[10px] text-foreground-muted font-bold uppercase tracking-wider">In Transit / En Route</p>
          <p className="text-2xl font-black text-blue-600 mt-1 font-heading">{transitCount}</p>
          <span className="text-[10px] text-blue-600 font-medium">Active Trips</span>
        </Card>

        <Card className="p-4 bg-surface border border-border border-l-4 border-l-emerald-500">
          <p className="text-[10px] text-foreground-muted font-bold uppercase tracking-wider">Active In-Service</p>
          <p className="text-2xl font-black text-emerald-600 mt-1 font-heading">{inProgressCount}</p>
          <span className="text-[10px] text-emerald-600 font-medium">At Doorstep</span>
        </Card>

        <Card className="p-4 bg-surface border border-border">
          <p className="text-[10px] text-foreground-muted font-bold uppercase tracking-wider">Settled Revenue</p>
          <p className="text-2xl font-black text-primary mt-1 font-heading">{formatCurrency(totalRevenue)}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Captured Balance</span>
        </Card>
      </div>

      {/* ─── Operational Tabs ─── */}
      <div className="flex border-b border-border gap-2">
        <button
          onClick={() => setActiveTab("queue")}
          className={`pb-3 px-4 text-xs font-bold transition-colors relative flex items-center gap-2 ${
            activeTab === "queue"
              ? "text-accent border-b-2 border-accent"
              : "text-foreground-secondary hover:text-primary"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Assignment Queue</span>
          {queueCount > 0 && (
            <Badge className="bg-amber-500 text-white text-[10px] px-1.5 py-0 font-bold ml-1">
              {queueCount}
            </Badge>
          )}
        </button>

        <button
          onClick={() => setActiveTab("transit")}
          className={`pb-3 px-4 text-xs font-bold transition-colors relative flex items-center gap-2 ${
            activeTab === "transit"
              ? "text-accent border-b-2 border-accent"
              : "text-foreground-secondary hover:text-primary"
          }`}
        >
          <Car className="w-4 h-4" />
          <span>In Transit / En Route</span>
          {transitCount > 0 && (
            <Badge className="bg-blue-500 text-white text-[10px] px-1.5 py-0 font-bold ml-1">
              {transitCount}
            </Badge>
          )}
        </button>

        <button
          onClick={() => setActiveTab("active")}
          className={`pb-3 px-4 text-xs font-bold transition-colors relative flex items-center gap-2 ${
            activeTab === "active"
              ? "text-accent border-b-2 border-accent"
              : "text-foreground-secondary hover:text-primary"
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>In Progress Services</span>
          {inProgressCount > 0 && (
            <Badge className="bg-emerald-500 text-white text-[10px] px-1.5 py-0 font-bold ml-1">
              {inProgressCount}
            </Badge>
          )}
        </button>
      </div>

      {/* ─── TAB 1: ASSIGNMENT QUEUE (DISPATCH) ─── */}
      {activeTab === "queue" && (
        <Card className="p-5 border border-border bg-surface space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-primary uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-500" /> Pending Dispatch Queue ({filteredQueue.length})
              </h3>
              <p className="text-xs text-foreground-secondary mt-0.5">
                These bookings require verified professional assignment. Assigning directly updates the customer confirmation screen in real time.
              </p>
            </div>

            <div className="w-full sm:w-64">
              <Input
                placeholder="Search reference, customer, area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          </div>

          {filteredQueue.length === 0 ? (
            <div className="py-12 text-center space-y-2 border border-dashed rounded-xl bg-muted/20">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h4 className="font-bold text-sm text-primary">All Bookings Dispatched!</h4>
              <p className="text-xs text-foreground-secondary max-w-sm mx-auto">
                There are currently no bookings awaiting technician assignment. New customer bookings will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border text-foreground-muted font-bold uppercase tracking-wider text-[10px] bg-muted/30">
                    <th className="py-2.5 px-3">Booking Reference</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Service & Area</th>
                    <th className="py-2.5 px-3">Scheduled Slot</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredQueue.map((b) => (
                    <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-primary">
                        #{b.booking_number || b.id}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-primary">{b.customer_name || "Valued Customer"}</div>
                        <div className="text-[11px] text-foreground-muted">{b.customer_phone || "+91 98300 00000"}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-primary">{b.service_name || "Home Service"}</div>
                        <div className="text-[11px] text-foreground-secondary flex items-center gap-1 mt-0.5 truncate max-w-xs">
                          <MapPin className="w-3 h-3 text-accent shrink-0" />
                          <span>
                            {typeof b.address === "string"
                              ? b.address
                              : b.address?.street
                              ? `${b.address.street}, ${b.address.city || "Kolkata"}`
                              : "Salt Lake, Kolkata"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-primary">{formatDate(b.scheduled_date)}</div>
                        <div className="text-[11px] text-foreground-muted">{b.scheduled_time_slot || "09:00 AM – 11:00 AM"}</div>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-primary">
                        {formatCurrency(b.total_amount || 0)}
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant="outline" className="border-amber-400 bg-amber-50 text-amber-800 text-[10px] font-bold">
                          {b.technician_name ? "ASSIGNED (PENDING ACCEPT)" : "AWAITING DISPATCH"}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Button
                          variant="accent"
                          size="sm"
                          onClick={() => {
                            setAssignTarget(b);
                            setSelectedProId("");
                          }}
                          className="h-7 text-xs font-bold gap-1 bg-[#FF6A00] hover:bg-[#E55F00] text-white"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Assign Pro</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* ─── TAB 2: IN TRANSIT / EN ROUTE ─── */}
      {activeTab === "transit" && (
        <Card className="p-5 border border-border bg-surface space-y-4">
          <h3 className="font-bold text-sm text-primary uppercase tracking-wider flex items-center gap-2">
            <Car className="w-4 h-4 text-blue-500" /> Active Field Dispatches & Live GPS ({transitSessions.length})
          </h3>

          {transitSessions.length === 0 ? (
            <div className="py-12 text-center space-y-2 border border-dashed rounded-xl bg-muted/20">
              <Car className="w-10 h-10 text-foreground-muted mx-auto" />
              <h4 className="font-bold text-sm text-primary">No Technicians En Route</h4>
              <p className="text-xs text-foreground-secondary max-w-sm mx-auto">
                No verified technicians are currently travelling to service locations. When a technician marks "Start Travel", live GPS telemetry activates here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transitSessions.map((b) => (
                <div
                  key={b.id}
                  className="p-4 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-primary">#{b.booking_number || b.id}</span>
                      <Badge className="bg-blue-500 text-white text-[10px] px-1.5 py-0 font-bold">
                        {b.status}
                      </Badge>
                      <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50 text-[10px] font-bold">
                        GPS Active
                      </Badge>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">{b.service_name}</h4>
                    <div className="flex items-center gap-3 text-foreground-secondary text-[11px]">
                      <span>Customer: <strong>{b.customer_name}</strong></span>
                      <span>•</span>
                      <span>Professional: <strong>{b.technician_name}</strong></span>
                      <span>•</span>
                      <span>Slot: {b.scheduled_time_slot}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button asChild variant="accent" size="sm" className="font-bold gap-1.5 h-8">
                      <Link to={`/bookings/${b.id}/track`}>
                        <span>View Live Radar</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* ─── TAB 3: IN PROGRESS SERVICES ─── */}
      {activeTab === "active" && (
        <Card className="p-5 border border-border bg-surface space-y-4">
          <h3 className="font-bold text-sm text-primary uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" /> Services In Progress ({activeServices.length})
          </h3>

          {activeServices.length === 0 ? (
            <div className="py-12 text-center space-y-2 border border-dashed rounded-xl bg-muted/20">
              <Activity className="w-10 h-10 text-foreground-muted mx-auto" />
              <h4 className="font-bold text-sm text-primary">No Active In-Progress Jobs</h4>
              <p className="text-xs text-foreground-secondary max-w-sm mx-auto">
                Jobs where technicians have arrived and verified the customer start OTP will be monitored here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeServices.map((b) => (
                <div
                  key={b.id}
                  className="p-4 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-primary">#{b.booking_number || b.id}</span>
                      <Badge className="bg-emerald-600 text-white text-[10px] px-1.5 py-0 font-bold">
                        IN PROGRESS
                      </Badge>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">{b.service_name}</h4>
                    <p className="text-[11px] text-foreground-secondary">
                      Customer: <strong>{b.customer_name}</strong> • Professional: <strong>{b.technician_name}</strong> ({b.technician_phone})
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm" className="h-8 text-xs font-semibold">
                      <Link to={`/admin/bookings`}>Manage Booking</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* ─── MANUAL DISPATCH MODAL ─── */}
      {assignTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-surface border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-border bg-muted/30 flex items-center justify-between">
              <div>
                <h3 className="font-heading text-base font-bold text-primary flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-accent" /> Dispatch Verified Professional
                </h3>
                <p className="text-xs text-foreground-secondary mt-0.5">
                  Booking #{assignTarget.booking_number || assignTarget.id} • {assignTarget.service_name}
                </p>
              </div>
              <button onClick={() => setAssignTarget(null)} className="font-bold text-foreground-muted hover:text-primary">
                ✕
              </button>
            </div>

            <form onSubmit={handleDispatchSubmit} className="p-5 space-y-4">
              <div className="p-3 rounded-xl bg-muted/30 border border-border text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-foreground-muted">Customer:</span>
                  <strong className="text-primary">{assignTarget.customer_name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground-muted">Service Location:</span>
                  <span className="text-primary font-medium text-right max-w-xs truncate">
                    {typeof assignTarget.address === "string" ? assignTarget.address : assignTarget.address?.street || "Salt Lake, Kolkata"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground-muted">Scheduled Slot:</span>
                  <strong className="text-primary">{assignTarget.scheduled_time_slot} ({formatDate(assignTarget.scheduled_date)})</strong>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-primary block">
                  Select Verified Professional <span className="text-rose-500">*</span>
                </label>
                <div className="max-h-56 overflow-y-auto space-y-2 border border-border rounded-xl p-2 bg-background">
                  {professionals.length === 0 ? (
                    <p className="text-xs text-foreground-muted p-2 text-center">No approved professionals registered in database.</p>
                  ) : (
                    professionals.map((pro) => (
                      <label
                        key={pro.id}
                        className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                          selectedProId === pro.id
                            ? "border-accent bg-accent/5 ring-1 ring-accent"
                            : "border-border hover:bg-muted/40"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="selectedPro"
                            value={pro.id}
                            checked={selectedProId === pro.id}
                            onChange={() => setSelectedProId(pro.id)}
                            className="text-accent focus:ring-accent"
                          />
                          <div>
                            <div className="font-bold text-primary flex items-center gap-1.5">
                              <span>{pro.name}</span>
                              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px] px-1 py-0 font-bold">
                                VERIFIED
                              </Badge>
                            </div>
                            <div className="text-[11px] text-foreground-secondary">
                              {pro.trade || "Technician"} • ⭐ {pro.rating || 4.9} • {pro.phone}
                            </div>
                          </div>
                        </div>

                        <span className="text-[11px] font-bold text-accent">
                          80% Payout Share
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <Button type="button" variant="outline" size="sm" onClick={() => setAssignTarget(null)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="accent"
                  size="sm"
                  disabled={!selectedProId}
                  className="font-bold bg-[#FF6A00] hover:bg-[#E55F00] text-white gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" /> Confirm Dispatch
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
