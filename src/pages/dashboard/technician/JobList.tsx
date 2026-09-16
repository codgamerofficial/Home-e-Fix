import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  MapPin,
  Clock,
  Navigation,
  CheckCircle2,
  XCircle,
  Phone,
  Calendar,
  AlertCircle,
  ChevronRight,
  DollarSign,
  Headphones,
  ShieldCheck,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { dbRepository, type BookingAssignment } from "@/services/db/repository";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/date";

export default function JobList() {
  const [tab, setTab] = useState<"new" | "active" | "completed">("new");
  const [assignments, setAssignments] = useState<BookingAssignment[]>([]);
  const [activeJobs, setActiveJobs] = useState<any[]>([]);
  const [completedJobs, setCompletedJobs] = useState<any[]>([]);
  const [now, setNow] = useState<number>(Date.now());
  const [declineTarget, setDeclineTarget] = useState<BookingAssignment | null>(null);
  const [declineReason, setDeclineReason] = useState("Too far away from current location");
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const loadData = () => {
    const asgs = dbRepository.getAssignments();
    setAssignments(asgs);

    const allBookings = dbRepository.getBookings();
    const active = allBookings.filter((b) =>
      ["PROFESSIONAL_ACCEPTED", "PROFESSIONAL_ON_THE_WAY", "PROFESSIONAL_ARRIVED", "SERVICE_STARTED", "AWAITING_CUSTOMER_APPROVAL"].includes(
        (b.status || "").toUpperCase()
      )
    );
    setActiveJobs(active);

    const completed = allBookings.filter((b) =>
      ["SERVICE_COMPLETED", "CUSTOMER_CONFIRMED", "COMPLETED"].includes(
        (b.status || "").toUpperCase()
      )
    );
    setCompletedJobs(completed);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAcceptJob = (asg: BookingAssignment) => {
    const success = dbRepository.acceptAssignment(asg.id, "pro-current");
    if (success) {
      loadData();
      setActionNotice(`Job #${asg.bookingNumber} accepted! Customer has been notified that you accepted the booking.`);
      setTab("active");
    } else {
      setActionNotice("Assignment has expired or has already been assigned to another professional.");
    }
    setTimeout(() => setActionNotice(null), 6000);
  };

  const handleConfirmDecline = () => {
    if (!declineTarget) return;
    dbRepository.declineAssignment(declineTarget.id, declineReason);
    setDeclineTarget(null);
    loadData();
    setActionNotice(`Job #${declineTarget.bookingNumber} declined. Reason logged: ${declineReason}`);
    setTimeout(() => setActionNotice(null), 6000);
  };

  const pendingAssignments = assignments.filter((a) => a.status === "PENDING");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-extrabold text-primary">Job Dispatch Center</h1>
            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1 font-bold text-[10px]">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Dispatch Active
            </Badge>
          </div>
          <p className="text-xs text-foreground-secondary mt-1">
            Real-time incoming job offers and live active assignments across operational service hubs
          </p>
        </div>

        {/* Tab Switcher */}
        {/* Tab Switcher */}
        <div className="w-full sm:w-auto grid grid-cols-3 sm:flex p-1 rounded-2xl bg-surface border border-border text-xs font-semibold">
          <button
            type="button"
            onClick={() => setTab("new")}
            className={`min-touch-target px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              tab === "new"
                ? "bg-primary text-white shadow-xs"
                : "text-foreground-secondary hover:text-primary"
            }`}
          >
            <span>New</span>
            {pendingAssignments.length > 0 && (
              <span className="h-4 min-w-4 px-1 rounded-full bg-accent text-[10px] font-bold text-white flex items-center justify-center">
                {pendingAssignments.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setTab("active")}
            className={`min-touch-target px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              tab === "active"
                ? "bg-primary text-white shadow-xs"
                : "text-foreground-secondary hover:text-primary"
            }`}
          >
            <span>Active</span>
            {activeJobs.length > 0 && (
              <span className="h-4 min-w-4 px-1 rounded-full bg-blue-500 text-[10px] font-bold text-white flex items-center justify-center">
                {activeJobs.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setTab("completed")}
            className={`min-touch-target px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
              tab === "completed"
                ? "bg-primary text-white shadow-xs"
                : "text-foreground-secondary hover:text-primary"
            }`}
          >
            <span>Done ({completedJobs.length})</span>
          </button>
        </div>
      </div>

      {/* ACTION BANNER */}
      {actionNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 flex items-center justify-between gap-3 text-xs font-semibold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="font-bold px-2 py-0.5">
            ✕
          </button>
        </div>
      )}

      {/* TAB 1: NEW INCOMING REQUESTS */}
      {tab === "new" && (
        <div className="space-y-4">
          {pendingAssignments.length === 0 ? (
            <Card className="p-10 text-center border border-border bg-surface space-y-4">
              <div className="mx-auto h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Radio className="h-6 w-6 animate-pulse" />
              </div>

              <div className="space-y-1">
                <h3 className="font-heading text-base font-bold text-primary">
                  No New Job Requests Right Now
                </h3>
                <p className="text-xs text-foreground-secondary max-w-md mx-auto">
                  Your availability is active in <strong>Salt Lake, New Town, and Kolkata Central</strong>. You will receive an immediate dispatch siren as soon as a homeowner books in your area.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap justify-center gap-3">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/professional/calendar" className="gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> View Service Calendar
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/professional/support" className="gap-1.5">
                    <Headphones className="h-3.5 w-3.5" /> Dispatch SOS Helpdesk
                  </Link>
                </Button>
              </div>
            </Card>
          ) : (
            pendingAssignments.map((asg) => {
              const secondsLeft = Math.max(
                0,
                Math.floor((new Date(asg.assignmentExpiresAt).getTime() - now) / 1000)
              );
              const isExpired = secondsLeft <= 0;

              return (
                <Card
                  key={asg.id}
                  className={`p-6 border transition-all ${
                    isExpired
                      ? "border-slate-200 bg-slate-50/50 opacity-60"
                      : "border-accent/40 bg-surface shadow-md"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="accent" className="font-mono text-[10px] px-2 py-0.5">
                          #{asg.bookingNumber}
                        </Badge>
                        {asg.isDevSeed && (
                          <Badge variant="outline" className="text-[9px] px-1 py-0 border-amber-300 bg-amber-50 text-amber-800">
                            DEV SEED
                          </Badge>
                        )}
                        <span className="text-xs text-foreground-muted">
                          {asg.scheduledTime} • {formatDate(asg.scheduledDate)}
                        </span>
                      </div>

                      <h3 className="font-heading text-lg font-bold text-primary">
                        {asg.serviceName}
                      </h3>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-foreground-secondary">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-accent shrink-0" />
                          <span>{asg.address} ({asg.distance})</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-accent shrink-0" />
                          <span>Customer: {asg.customerName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row lg:flex-col items-end justify-between lg:justify-center gap-4 border-t lg:border-t-0 pt-4 lg:pt-0 border-border">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-foreground-muted block tracking-wider">
                          Net Technician Payout (80%)
                        </span>
                        <span className="font-heading text-2xl font-extrabold text-accent">
                          {formatCurrency(asg.payoutAmount)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        {!isExpired ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-rose-600 border-rose-200 hover:bg-rose-50 flex-1 sm:flex-none"
                              onClick={() => setDeclineTarget(asg)}
                            >
                              Decline
                            </Button>
                            <Button
                              variant="accent"
                              size="sm"
                              className="font-bold shadow-xs flex-1 sm:flex-none"
                              onClick={() => handleAcceptJob(asg)}
                            >
                              Accept Job ({secondsLeft}s)
                            </Button>
                          </>
                        ) : (
                          <Badge variant="outline" className="text-rose-600 border-rose-200">
                            Assignment Expired
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: ACTIVE JOBS */}
      {tab === "active" && (
        <div className="space-y-4">
          {activeJobs.length === 0 ? (
            <Card className="p-10 text-center border border-dashed border-border bg-surface space-y-2">
              <CheckCircle2 className="mx-auto h-8 w-8 text-foreground-muted" />
              <h4 className="font-heading font-bold text-sm text-primary">No Active Jobs In Progress</h4>
              <p className="text-xs text-foreground-secondary">
                Accepted jobs that require travel, arrival, or OTP starting will appear here.
              </p>
            </Card>
          ) : (
            activeJobs.map((job) => (
              <Card key={job.id} className="p-5 border border-border bg-surface space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-accent">#{job.booking_number}</span>
                      <Badge variant="secondary" className="bg-sky-50 text-sky-700 font-bold text-[10px]">
                        {job.status}
                      </Badge>
                    </div>
                    <h4 className="font-heading text-sm font-bold text-primary mt-1">{job.service_name}</h4>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-foreground-muted block">Estimated Payout</span>
                    <span className="font-heading text-base font-extrabold text-accent">
                      {formatCurrency(Math.round(job.subtotal * 0.8))}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <p className="text-foreground-secondary">Customer: <strong>{job.customer_name}</strong> • {job.customer_phone}</p>
                    <p className="text-foreground-muted flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-accent" />
                      {typeof job.address === "string" ? job.address : `${job.address?.street}, ${job.address?.city}`}
                    </p>
                  </div>

                  <Button variant="accent" size="sm" asChild className="font-bold">
                    <Link to={`/professional/jobs/${job.id}`}>
                      Open Job Workspace <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* TAB 3: COMPLETED JOBS */}
      {tab === "completed" && (
        <div className="space-y-3">
          {completedJobs.length === 0 ? (
            <Card className="p-10 text-center border border-dashed border-border bg-surface space-y-2">
              <CheckCircle2 className="mx-auto h-8 w-8 text-foreground-muted" />
              <h4 className="font-heading font-bold text-sm text-primary">No Completed Jobs Yet</h4>
              <p className="text-xs text-foreground-secondary">
                Completed jobs that have generated earnings and invoices will show here.
              </p>
            </Card>
          ) : (
            completedJobs.map((job) => (
              <div
                key={job.id}
                className="p-4 rounded-xl border border-border bg-surface flex items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-primary">{job.booking_number}</span>
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 text-[10px]">
                      COMPLETED
                    </Badge>
                  </div>
                  <h4 className="font-bold text-primary mt-0.5">{job.service_name}</h4>
                  <p className="text-[11px] text-foreground-muted">Customer: {job.customer_name} • {formatDate(job.scheduled_date)}</p>
                </div>

                <div className="text-right">
                  <span className="font-heading font-bold text-sm text-accent block">
                    + {formatCurrency(Math.round(job.subtotal * 0.8))}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold">Settled to Wallet</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* DECLINE JOB REASON MODAL */}
      {declineTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <Card className="w-full max-w-md border border-border bg-surface p-6 space-y-4 shadow-2xl">
            <h3 className="font-heading text-base font-bold text-primary">
              Decline Job #{declineTarget.bookingNumber}
            </h3>
            <p className="text-xs text-foreground-secondary">
              Please specify the operational reason for declining so our automated dispatch system can re-route to an adjacent technician immediately.
            </p>

            <div className="space-y-2">
              {[
                "Too far away from current location",
                "Currently on another active service",
                "Outside my registered trade specialty",
                "Personal emergency or vehicle breakdown",
              ].map((r) => (
                <label
                  key={r}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer text-xs ${
                    declineReason === r
                      ? "border-accent bg-accent/5 font-semibold text-primary"
                      : "border-border text-foreground-secondary hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="declineReason"
                    value={r}
                    checked={declineReason === r}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    className="accent-accent"
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="ghost" size="sm" onClick={() => setDeclineTarget(null)}>
                Back
              </Button>
              <Button
                variant="accent"
                size="sm"
                onClick={handleConfirmDecline}
                className="font-bold bg-rose-600 hover:bg-rose-700 text-white"
              >
                Confirm Decline
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
