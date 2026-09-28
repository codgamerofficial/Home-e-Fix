import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import {
  Activity,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  DollarSign,
  TrendingUp,
  RotateCcw,
  Search,
  ArrowUpRight,
  ShieldCheck,
  Briefcase,
  Calendar,
  RefreshCw,
  Sliders,
  ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { dbRepository } from "@/services/db/repository";
import { subscribeToBookingSync } from "@/services/realtime/sync";
import { formatCurrency } from "@/lib/currency";
import { ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/store/auth.store";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, isSuperAdmin } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSearchCategory, setSelectedSearchCategory] = useState<"ALL" | "BOOKINGS" | "CUSTOMERS" | "PROFESSIONALS">("ALL");

  // Real Database State
  const [bookings, setBookings] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [refunds, setRefunds] = useState<any[]>([]);
  const [isDevSeed, setIsDevSeed] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>(new Date().toLocaleTimeString());

  const loadData = () => {
    const rawBookings = dbRepository.getBookings();
    setBookings(rawBookings);

    const rawPros = dbRepository.getProfessionals();
    setProfessionals(rawPros);

    const rawCustomers = dbRepository.getCustomers();
    setCustomers(rawCustomers);

    const rawAssignments = dbRepository.getAssignments();
    setAssignments(rawAssignments);

    const rawTickets = dbRepository.getSupportTickets();
    setSupportTickets(rawTickets);

    const rawRefunds = dbRepository.getRefunds();
    setRefunds(rawRefunds);

    setIsDevSeed(dbRepository.isDevSeedEnabled());
    setLastRefreshed(new Date().toLocaleTimeString());
  };

  useEffect(() => {
    loadData();

    // Listen to realtime booking updates across channels
    const unsubscribe = subscribeToBookingSync("*", () => {
      loadData();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // ─── 1. TODAY'S METRICS ───
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  const todayBookings = useMemo(() => {
    return bookings.filter((b) => {
      const createdAt = (b.created_at || "").split("T")[0];
      const scheduledDate = b.scheduled_date || "";
      return createdAt === todayStr || scheduledDate === todayStr;
    });
  }, [bookings, todayStr]);

  const activeJobs = useMemo(() => {
    return bookings.filter((b) => {
      const st = (b.status || "").toUpperCase();
      return (
        st === "PROFESSIONAL_ON_THE_WAY" ||
        st === "ON_THE_WAY" ||
        st === "PROFESSIONAL_ARRIVED" ||
        st === "SERVICE_STARTED" ||
        st === "IN_PROGRESS" ||
        st === "AWAITING_CUSTOMER_APPROVAL"
      );
    });
  }, [bookings]);

  const completedJobs = useMemo(() => {
    return bookings.filter((b) => {
      const st = (b.status || "").toUpperCase();
      return st === "COMPLETED" || st === "SERVICE_COMPLETED";
    });
  }, [bookings]);

  const cancelledJobs = useMemo(() => {
    return bookings.filter((b) => {
      const st = (b.status || "").toUpperCase();
      return st === "CANCELLED";
    });
  }, [bookings]);

  const pendingAssignments = useMemo(() => {
    return bookings.filter((b) => {
      const st = (b.status || "").toUpperCase();
      const hasTech = Boolean(b.technician_id && b.technician_name);
      return (
        (!hasTech || st === "CONFIRMED" || st === "ASSIGNMENT_PENDING" || st === "SEARCHING_PROFESSIONAL") &&
        st !== "CANCELLED" &&
        st !== "REFUNDED" &&
        st !== "COMPLETED" &&
        st !== "SERVICE_COMPLETED"
      );
    });
  }, [bookings]);

  const grossRevenue = useMemo(() => {
    return completedJobs.reduce((acc, b) => acc + (Number(b.total_amount) || 0), 0);
  }, [completedJobs]);

  const pendingPayouts = useMemo(() => {
    // Verified completed jobs awaiting release to partner
    return completedJobs.filter((b) => b.payout_status !== "PAID").length;
  }, [completedJobs]);

  const pendingRefunds = useMemo(() => {
    return refunds.filter((r) => r.status === "REQUESTED" || r.status === "PENDING_APPROVAL").length;
  }, [refunds]);

  // ─── 2. PROFESSIONALS METRICS ───
  const approvedPros = useMemo(() => {
    return professionals.filter((p) => (p.kycStatus || "").toUpperCase() === "APPROVED");
  }, [professionals]);

  const pendingPros = useMemo(() => {
    return professionals.filter((p) => {
      const st = (p.kycStatus || "").toUpperCase();
      return st === "PENDING" || st === "UNDER_REVIEW" || st === "APPLICATION_SUBMITTED";
    });
  }, [professionals]);

  const onlinePros = useMemo(() => {
    return professionals.filter((p) => p.isAvailable && (p.kycStatus || "").toUpperCase() === "APPROVED");
  }, [professionals]);

  const busyPros = useMemo(() => {
    return professionals.filter((p) => !p.isAvailable && (p.kycStatus || "").toUpperCase() === "APPROVED");
  }, [professionals]);

  const suspendedPros = useMemo(() => {
    return professionals.filter((p) => (p.kycStatus || "").toUpperCase() === "SUSPENDED" || (p.kycStatus || "").toUpperCase() === "REJECTED");
  }, [professionals]);

  // ─── 3. CUSTOMER METRICS ───
  const activeCustomers = useMemo(() => {
    return customers.filter((c) => c.status === "active").length;
  }, [customers]);

  const newCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (!c.joinedDate) return false;
      return true;
    }).length;
  }, [customers]);

  // ─── 4. OPERATIONS RADAR ───
  const unassignedJobs = pendingAssignments.length;

  const jobsOnTheWay = useMemo(() => {
    return bookings.filter((b) => {
      const st = (b.status || "").toUpperCase();
      return st === "PROFESSIONAL_ON_THE_WAY" || st === "ON_THE_WAY" || st === "PROFESSIONAL_ARRIVED";
    }).length;
  }, [bookings]);

  const delayedJobs = useMemo(() => {
    return bookings.filter((b) => {
      const st = (b.status || "").toUpperCase();
      if (st === "COMPLETED" || st === "SERVICE_COMPLETED" || st === "CANCELLED" || st === "REFUNDED") {
        return false;
      }
      if (b.scheduled_date && b.scheduled_date < todayStr) return true;
      return false;
    }).length;
  }, [bookings, todayStr]);

  const failedAssignments = useMemo(() => {
    return assignments.filter((a) => a.status === "EXPIRED" || a.status === "DECLINED").length;
  }, [assignments]);

  const openSupportTickets = useMemo(() => {
    return supportTickets.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS").length;
  }, [supportTickets]);

  // ─── GLOBAL SEARCH LOGIC ───
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase().trim();

    const matchedBookings = bookings.filter(
      (b) =>
        (b.id && b.id.toLowerCase().includes(q)) ||
        (b.booking_number && b.booking_number.toLowerCase().includes(q)) ||
        (b.customer_name && b.customer_name.toLowerCase().includes(q)) ||
        (b.customer_phone && b.customer_phone.includes(q)) ||
        (b.service_name && b.service_name.toLowerCase().includes(q)) ||
        (b.technician_name && b.technician_name.toLowerCase().includes(q))
    );

    const matchedCustomers = customers.filter(
      (c) =>
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.phone && c.phone.includes(q)) ||
        (c.id && c.id.toLowerCase().includes(q))
    );

    const matchedPros = professionals.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.email && p.email.toLowerCase().includes(q)) ||
        (p.phone && p.phone.includes(q)) ||
        (p.id && p.id.toLowerCase().includes(q)) ||
        (p.primaryCategory && p.primaryCategory.toLowerCase().includes(q))
    );

    return {
      bookings: matchedBookings,
      customers: matchedCustomers,
      professionals: matchedPros,
      totalCount: matchedBookings.length + matchedCustomers.length + matchedPros.length,
    };
  }, [searchQuery, bookings, customers, professionals]);

  return (
    <div className="space-y-8 pb-12">
      {/* ─── TOP BAR: PLATFORM OWNER / CONTROL CENTER HEADER ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
              Home-e-Fix Control Center
            </h1>
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs px-2.5 py-0.5 font-bold uppercase tracking-wider">
              {user?.role === "super_admin" ? "SUPER ADMIN" : "ADMIN"}
            </Badge>
            {isDevSeed && (
              <Badge variant="outline" className="text-[10px] font-mono text-amber-600 border-amber-300 bg-amber-50">
                DEV SEED ACTIVE
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-foreground-secondary mt-1">
            Live marketplace operations, verified partner dispatching, real-time database analytics & platform governance.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-foreground">Synced at {lastRefreshed}</div>
            <div className="text-[11px] text-foreground-muted">Live DB Connection Active</div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="h-9 px-3 gap-1.5 text-xs font-medium cursor-pointer hover:bg-muted"
            title="Refresh database state"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>
          {isSuperAdmin() && (
            <Link to={ROUTES.ADMIN_ADMINS}>
              <Button size="sm" className="h-9 gap-1.5 text-xs font-bold bg-primary hover:bg-primary-light text-white shadow-xs">
                <ShieldCheck className="h-4 w-4" />
                <span>Admin Users</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* ─── GLOBAL SEARCH BAR (Section 18) ─── */}
      <Card className="p-4 sm:p-5 border border-border bg-surface shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Global Search: Booking ID (HEF-...), Customer Name, Partner, Phone, Email, Invoice..."
              className="pl-10 h-11 text-sm bg-background border-border"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-foreground-muted hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex items-center gap-1 bg-muted p-1 rounded-xl border border-border text-xs shrink-0">
            <button
              onClick={() => setSelectedSearchCategory("ALL")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                selectedSearchCategory === "ALL" ? "bg-surface shadow-xs text-primary" : "text-foreground-secondary"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedSearchCategory("BOOKINGS")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                selectedSearchCategory === "BOOKINGS" ? "bg-surface shadow-xs text-primary" : "text-foreground-secondary"
              }`}
            >
              Bookings
            </button>
            <button
              onClick={() => setSelectedSearchCategory("CUSTOMERS")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                selectedSearchCategory === "CUSTOMERS" ? "bg-surface shadow-xs text-primary" : "text-foreground-secondary"
              }`}
            >
              Customers
            </button>
            <button
              onClick={() => setSelectedSearchCategory("PROFESSIONALS")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                selectedSearchCategory === "PROFESSIONALS" ? "bg-surface shadow-xs text-primary" : "text-foreground-secondary"
              }`}
            >
              Partners
            </button>
          </div>
        </div>

        {/* Global Search Results Dropdown/Drawer */}
        {searchResults && (
          <div className="pt-2 border-t border-border mt-3 space-y-3">
            <div className="flex items-center justify-between text-xs text-foreground-muted">
              <span>Found {searchResults.totalCount} matches in database</span>
              <span className="font-mono text-[11px]">Query: "{searchQuery}"</span>
            </div>

            {searchResults.totalCount === 0 ? (
              <div className="p-4 text-center text-xs text-foreground-secondary">
                No matching records found in database for "{searchQuery}".
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1">
                {/* Bookings Match */}
                {(selectedSearchCategory === "ALL" || selectedSearchCategory === "BOOKINGS") &&
                  searchResults.bookings.map((b) => (
                    <div
                      key={b.id}
                      onClick={() => navigate(`${ROUTES.ADMIN_BOOKINGS}?id=${b.id}`)}
                      className="p-3 rounded-xl border border-border bg-background hover:border-primary/40 cursor-pointer transition-all space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-primary">{b.booking_number || b.id}</span>
                        <Badge variant="outline" className="text-[10px] uppercase font-bold">
                          {b.status}
                        </Badge>
                      </div>
                      <div className="text-xs font-medium text-foreground truncate">{b.service_name}</div>
                      <div className="text-[11px] text-foreground-muted">
                        Cust: {b.customer_name} ({b.customer_phone})
                      </div>
                    </div>
                  ))}

                {/* Customers Match */}
                {(selectedSearchCategory === "ALL" || selectedSearchCategory === "CUSTOMERS") &&
                  searchResults.customers.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => navigate(ROUTES.ADMIN_CUSTOMERS)}
                      className="p-3 rounded-xl border border-border bg-background hover:border-primary/40 cursor-pointer transition-all space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">{c.name}</span>
                        <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-300">
                          {c.orders} orders
                        </Badge>
                      </div>
                      <div className="text-[11px] text-foreground-muted truncate">{c.email}</div>
                      <div className="text-[11px] text-foreground-muted font-mono">{c.phone}</div>
                    </div>
                  ))}

                {/* Professionals Match */}
                {(selectedSearchCategory === "ALL" || selectedSearchCategory === "PROFESSIONALS") &&
                  searchResults.professionals.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => navigate(ROUTES.ADMIN_PROFESSIONALS)}
                      className="p-3 rounded-xl border border-border bg-background hover:border-primary/40 cursor-pointer transition-all space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">{p.name}</span>
                        <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
                          {p.kycStatus === "APPROVED" ? "Verified Partner" : p.kycStatus}
                        </Badge>
                      </div>
                      <div className="text-[11px] text-foreground-muted">{p.primaryCategory || "All Services"}</div>
                      <div className="text-[11px] text-foreground-muted font-mono">{p.phone}</div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* ─── SECTION 1: TODAY'S LIVE SNAPSHOT (Section 7) ─── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-primary">Today's Marketplace Metrics</h2>
          </div>
          <span className="text-xs text-foreground-muted font-medium">Real DB records for {todayStr}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* 1. Today's Bookings */}
          <Card className="p-4 border border-border bg-surface shadow-xs space-y-2 hover:border-primary/30 transition-all">
            <div className="flex items-center justify-between text-xs text-foreground-secondary font-medium">
              <span>Bookings</span>
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-extrabold text-foreground">{todayBookings.length}</div>
            <div className="text-[11px] text-foreground-muted">Total placed or scheduled today</div>
          </Card>

          {/* 2. Pending Assignments */}
          <Card className="p-4 border border-border bg-surface shadow-xs space-y-2 hover:border-primary/30 transition-all">
            <div className="flex items-center justify-between text-xs text-foreground-secondary font-medium">
              <span>Pending Assignments</span>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
              {pendingAssignments.length}
            </div>
            <div className="text-[11px] text-foreground-muted">Awaiting partner dispatch</div>
          </Card>

          {/* 3. Active Jobs */}
          <Card className="p-4 border border-border bg-surface shadow-xs space-y-2 hover:border-primary/30 transition-all">
            <div className="flex items-center justify-between text-xs text-foreground-secondary font-medium">
              <span>Active Jobs</span>
              <Activity className="h-4 w-4 text-blue-500 animate-pulse" />
            </div>
            <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
              {activeJobs.length}
            </div>
            <div className="text-[11px] text-foreground-muted">En route, arrived, in service</div>
          </Card>

          {/* 4. Completed Jobs */}
          <Card className="p-4 border border-border bg-surface shadow-xs space-y-2 hover:border-primary/30 transition-all">
            <div className="flex items-center justify-between text-xs text-foreground-secondary font-medium">
              <span>Completed Jobs</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {completedJobs.length}
            </div>
            <div className="text-[11px] text-foreground-muted">Successfully fulfilled</div>
          </Card>

          {/* 5. Cancelled Jobs */}
          <Card className="p-4 border border-border bg-surface shadow-xs space-y-2 hover:border-primary/30 transition-all">
            <div className="flex items-center justify-between text-xs text-foreground-secondary font-medium">
              <span>Cancelled Jobs</span>
              <XCircle className="h-4 w-4 text-rose-500" />
            </div>
            <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
              {cancelledJobs.length}
            </div>
            <div className="text-[11px] text-foreground-muted">Customer or partner cancelled</div>
          </Card>

          {/* 6. Revenue */}
          <Card className="p-4 border border-border bg-surface shadow-xs space-y-2 hover:border-primary/30 transition-all">
            <div className="flex items-center justify-between text-xs text-foreground-secondary font-medium">
              <span>Revenue</span>
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(grossRevenue)}
            </div>
            <div className="text-[11px] text-foreground-muted">Completed orders gross total</div>
          </Card>

          {/* 7. Pending Payouts */}
          <Card className="p-4 border border-border bg-surface shadow-xs space-y-2 hover:border-primary/30 transition-all">
            <div className="flex items-center justify-between text-xs text-foreground-secondary font-medium">
              <span>Pending Payouts</span>
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-extrabold text-foreground">{pendingPayouts}</div>
            <div className="text-[11px] text-foreground-muted">Awaiting release to partners</div>
          </Card>

          {/* 8. Refund Requests */}
          <Card className="p-4 border border-border bg-surface shadow-xs space-y-2 hover:border-primary/30 transition-all">
            <div className="flex items-center justify-between text-xs text-foreground-secondary font-medium">
              <span>Refund Requests</span>
              <RotateCcw className="h-4 w-4 text-orange-500" />
            </div>
            <div className="text-2xl font-extrabold text-orange-600 dark:text-orange-400">
              {pendingRefunds}
            </div>
            <div className="text-[11px] text-foreground-muted">Requires admin review</div>
          </Card>
        </div>
      </div>

      {/* ─── SECTION 2: PROFESSIONALS & CUSTOMERS SPLIT ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PROFESSIONALS METRICS */}
        <Card className="p-5 border border-border bg-surface shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              <h2 className="text-base font-bold text-primary">Professionals & Partners</h2>
            </div>
            <Link to={ROUTES.ADMIN_PROFESSIONALS} className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
              <span>View All ({professionals.length})</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-background border border-border text-center space-y-1">
              <div className="text-xl font-extrabold text-foreground">{professionals.length}</div>
              <div className="text-[11px] font-semibold text-foreground-secondary">Total</div>
            </div>
            <div className="p-3 rounded-xl bg-background border border-border text-center space-y-1">
              <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{approvedPros.length}</div>
              <div className="text-[11px] font-semibold text-foreground-secondary">Approved Partners</div>
            </div>
            <div className="p-3 rounded-xl bg-background border border-border text-center space-y-1">
              <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400">{pendingPros.length}</div>
              <div className="text-[11px] font-semibold text-foreground-secondary">Pending Approval</div>
            </div>
            <div className="p-3 rounded-xl bg-background border border-border text-center space-y-1">
              <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400">{onlinePros.length}</div>
              <div className="text-[11px] font-semibold text-foreground-secondary">Online & Ready</div>
            </div>
            <div className="p-3 rounded-xl bg-background border border-border text-center space-y-1">
              <div className="text-xl font-extrabold text-purple-600 dark:text-purple-400">{busyPros.length}</div>
              <div className="text-[11px] font-semibold text-foreground-secondary">Busy on Job</div>
            </div>
            <div className="p-3 rounded-xl bg-background border border-border text-center space-y-1">
              <div className="text-xl font-extrabold text-rose-600 dark:text-rose-400">{suspendedPros.length}</div>
              <div className="text-[11px] font-semibold text-foreground-secondary">Suspended</div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-foreground-muted">
            <span>Badge Standard: Home-e-Fix Verified Partner</span>
            <span className="font-semibold text-emerald-600">Zero Mandatory KYC</span>
          </div>
        </Card>

        {/* CUSTOMERS METRICS */}
        <Card className="p-5 border border-border bg-surface shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="text-base font-bold text-primary">Customers CRM</h2>
            </div>
            <Link to={ROUTES.ADMIN_CUSTOMERS} className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
              <span>View All ({customers.length})</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-background border border-border text-center space-y-1">
              <div className="text-xl font-extrabold text-foreground">{customers.length}</div>
              <div className="text-[11px] font-semibold text-foreground-secondary">Total Customers</div>
            </div>
            <div className="p-3 rounded-xl bg-background border border-border text-center space-y-1">
              <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{newCustomers}</div>
              <div className="text-[11px] font-semibold text-foreground-secondary">New Signups</div>
            </div>
            <div className="p-3 rounded-xl bg-background border border-border text-center space-y-1">
              <div className="text-xl font-extrabold text-primary">{activeCustomers}</div>
              <div className="text-[11px] font-semibold text-foreground-secondary">Active Accounts</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-muted/50 border border-border space-y-2">
            <div className="text-xs font-bold text-foreground">Customer Protection & Privacy</div>
            <p className="text-[11px] text-foreground-secondary leading-relaxed">
              Customer accounts are protected by database-level role isolation. Customers cannot view administrative routes, financial balances, or partner management.
            </p>
          </div>
        </Card>
      </div>

      {/* ─── SECTION 3: OPERATIONS RADAR (Section 7) ─── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-primary">Live Operations Radar</h2>
          </div>
          <Link to={ROUTES.ADMIN_LIVE_OPERATIONS} className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
            <span>Open Dispatch Radar</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* Unassigned Jobs */}
          <Card className="p-4 border border-border bg-surface shadow-xs space-y-1.5 hover:border-amber-400 transition-all">
            <div className="text-xs font-semibold text-foreground-secondary">Unassigned Jobs</div>
            <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{unassignedJobs}</div>
            <div className="text-[11px] text-foreground-muted">Ready for allocation</div>
          </Card>

          {/* Jobs On The Way */}
          <Card className="p-4 border border-border bg-surface shadow-xs space-y-1.5 hover:border-blue-400 transition-all">
            <div className="text-xs font-semibold text-foreground-secondary">Jobs On The Way</div>
            <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">{jobsOnTheWay}</div>
            <div className="text-[11px] text-foreground-muted">Partner in transit</div>
          </Card>

          {/* Delayed Jobs */}
          <Card className="p-4 border border-border bg-surface shadow-xs space-y-1.5 hover:border-rose-400 transition-all">
            <div className="text-xs font-semibold text-foreground-secondary">Delayed Jobs</div>
            <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">{delayedJobs}</div>
            <div className="text-[11px] text-foreground-muted">Past scheduled slot</div>
          </Card>

          {/* Failed Assignments */}
          <Card className="p-4 border border-border bg-surface shadow-xs space-y-1.5 hover:border-orange-400 transition-all">
            <div className="text-xs font-semibold text-foreground-secondary">Failed Assignments</div>
            <div className="text-2xl font-extrabold text-orange-600 dark:text-orange-400">{failedAssignments}</div>
            <div className="text-[11px] text-foreground-muted">Declined or expired</div>
          </Card>

          {/* Open Support Tickets */}
          <Card className="p-4 border border-border bg-surface shadow-xs space-y-1.5 hover:border-primary/40 transition-all">
            <div className="text-xs font-semibold text-foreground-secondary">Open Support Tickets</div>
            <div className="text-2xl font-extrabold text-primary">{openSupportTickets}</div>
            <div className="text-[11px] text-foreground-muted">Customer queries pending</div>
          </Card>
        </div>
      </div>

      {/* ─── SECTION 4: QUICK ACTION SHORTCUTS (Real Marketplace Operations) ─── */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-primary">Operational Management Portals</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <Link
            to={ROUTES.ADMIN_BOOKINGS}
            className="p-3.5 rounded-2xl border border-border bg-surface hover:border-primary/50 hover:shadow-xs transition-all flex flex-col items-center text-center space-y-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
              <Calendar className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-foreground">Bookings</span>
          </Link>

          <Link
            to={ROUTES.ADMIN_LIVE_OPERATIONS}
            className="p-3.5 rounded-2xl border border-border bg-surface hover:border-primary/50 hover:shadow-xs transition-all flex flex-col items-center text-center space-y-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Activity className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-foreground">Live Dispatch</span>
          </Link>

          <Link
            to={ROUTES.ADMIN_PROFESSIONALS}
            className="p-3.5 rounded-2xl border border-border bg-surface hover:border-primary/50 hover:shadow-xs transition-all flex flex-col items-center text-center space-y-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Briefcase className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-foreground">Partners</span>
          </Link>

          <Link
            to={ROUTES.ADMIN_CUSTOMERS}
            className="p-3.5 rounded-2xl border border-border bg-surface hover:border-primary/50 hover:shadow-xs transition-all flex flex-col items-center text-center space-y-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-foreground">Customers</span>
          </Link>

          <Link
            to={ROUTES.ADMIN_SERVICES}
            className="p-3.5 rounded-2xl border border-border bg-surface hover:border-primary/50 hover:shadow-xs transition-all flex flex-col items-center text-center space-y-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Sliders className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-foreground">Services CMS</span>
          </Link>

          <Link
            to={ROUTES.ADMIN_PAYMENTS}
            className="p-3.5 rounded-2xl border border-border bg-surface hover:border-primary/50 hover:shadow-xs transition-all flex flex-col items-center text-center space-y-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <DollarSign className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-foreground">Finance</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
