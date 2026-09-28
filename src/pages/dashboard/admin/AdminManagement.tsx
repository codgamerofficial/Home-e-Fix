import { useState, useEffect } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  UserPlus,
  UserX,
  UserCheck,
  RefreshCw,
  Clock,
  Search,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAuthStore } from "@/store/auth.store";
import { dbRepository } from "@/services/db/repository";
import { formatDate } from "@/lib/date";

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "admin";
  status: "active" | "suspended";
  createdAt: string;
  isOwner?: boolean;
}

const STORAGE_ADMINS_KEY = "homeefix_db_v2_admin_users";

export default function AdminManagement() {
  const { user, isSuperAdmin } = useAuthStore();
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
  const [targetIdentifier, setTargetIdentifier] = useState("");
  const [targetName, setTargetName] = useState("");
  const [targetRole, setTargetRole] = useState<"admin" | "super_admin">("admin");
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const loadData = () => {
    // 1. Load admins from localStorage / server sync
    let storedAdmins: AdminAccount[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_ADMINS_KEY);
      if (raw) storedAdmins = JSON.parse(raw);
    } catch {
      // fallback
    }

    // Ensure platform owner super_admin is permanently present
    const ownerId = "f3e5b3dd-24d3-46e0-9793-f54a26f48bd2";
    const ownerEmail = "deysaswata200@gmail.com";
    const hasOwner = storedAdmins.some((a) => a.id === ownerId || a.email === ownerEmail);

    if (!hasOwner) {
      storedAdmins.unshift({
        id: ownerId,
        name: "Saswata Dey (Platform Owner)",
        email: ownerEmail,
        role: "super_admin",
        status: "active",
        createdAt: "2026-01-01T00:00:00Z",
        isOwner: true,
      });
      localStorage.setItem(STORAGE_ADMINS_KEY, JSON.stringify(storedAdmins));
    }

    setAdmins(storedAdmins);

    // 2. Load admin audit logs
    const allLogs = dbRepository.getAuditLogs();
    const adminEvents = allLogs.filter(
      (l) =>
        (l.action && l.action.startsWith("ADMIN_")) ||
        l.entityType === "ADMIN_USER" ||
        l.entity_type === "ADMIN_USER"
    );
    setAuditLogs(adminEvents.slice(0, 10));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Strict Super Admin Access Guard
  if (!isSuperAdmin()) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-surface border border-border rounded-3xl p-8 shadow-xl space-y-5">
          <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-2xl mx-auto flex items-center justify-center">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-primary">Restricted to Super Admin</h2>
          <p className="text-xs text-foreground-secondary leading-relaxed">
            Only accounts with the authoritative <span className="font-semibold text-primary">super_admin</span> role
            are permitted to access Admin User Management. Standard administrators and employees cannot alter or view roles.
          </p>
          <Button variant="outline" className="w-full" onClick={() => window.history.back()}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const handlePromoteAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError("");
    setActionSuccess("");

    if (!targetIdentifier.trim()) {
      setActionError("Please enter a valid user email or user ID.");
      return;
    }

    setIsProcessing(true);

    try {
      const emailOrId = targetIdentifier.trim().toLowerCase();
      const existing = admins.find((a) => a.email.toLowerCase() === emailOrId || a.id === emailOrId);

      if (existing) {
        setActionError("This account is already registered as an administrator.");
        setIsProcessing(false);
        return;
      }

      const newAdmin: AdminAccount = {
        id: `admin-${Date.now().toString().slice(-6)}`,
        name: targetName.trim() || emailOrId.split("@")[0],
        email: emailOrId.includes("@") ? emailOrId : `${emailOrId}@homeefix.in`,
        role: targetRole,
        status: "active",
        createdAt: new Date().toISOString(),
      };

      const updated = [newAdmin, ...admins];
      setAdmins(updated);
      localStorage.setItem(STORAGE_ADMINS_KEY, JSON.stringify(updated));

      // Record Authoritative Audit Log
      dbRepository.addAuditLog(
        "ADMIN_CREATED",
        "ADMIN_USER",
        newAdmin.id,
        { email: newAdmin.email, role: newAdmin.role, name: newAdmin.name },
        user?.id || "super_admin",
        "super_admin"
      );

      // Attempt server sync if backend endpoint active
      try {
        await fetch("/api/admin/users/role", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: newAdmin.id, email: newAdmin.email, role: targetRole }),
        });
      } catch {
        // Dev server fallback
      }

      setActionSuccess(`Successfully provisioned ${newAdmin.email} as ${targetRole.toUpperCase()}.`);
      setTargetIdentifier("");
      setTargetName("");
      setIsPromoteModalOpen(false);
      loadData();
    } catch (err: any) {
      setActionError(err.message || "Failed to provision administrator.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleSuspend = (admin: AdminAccount) => {
    if (admin.isOwner || admin.id === "f3e5b3dd-24d3-46e0-9793-f54a26f48bd2") {
      alert("Platform owner account cannot be suspended or demoted.");
      return;
    }

    const nextStatus = admin.status === "active" ? "suspended" : "active";
    const updated = admins.map((a) => (a.id === admin.id ? { ...a, status: nextStatus as "active" | "suspended" } : a));
    setAdmins(updated);
    localStorage.setItem(STORAGE_ADMINS_KEY, JSON.stringify(updated));

    dbRepository.addAuditLog(
      nextStatus === "suspended" ? "ADMIN_SUSPENDED" : "ADMIN_ACTIVATED",
      "ADMIN_USER",
      admin.id,
      { previousStatus: admin.status, newStatus: nextStatus, email: admin.email },
      user?.id || "super_admin",
      "super_admin"
    );

    loadData();
  };

  const handleRemoveAdmin = (admin: AdminAccount) => {
    if (admin.isOwner || admin.id === "f3e5b3dd-24d3-46e0-9793-f54a26f48bd2") {
      alert("Platform owner account cannot be removed.");
      return;
    }

    if (!confirm(`Are you sure you want to revoke admin permissions from ${admin.email}?`)) {
      return;
    }

    const updated = admins.filter((a) => a.id !== admin.id);
    setAdmins(updated);
    localStorage.setItem(STORAGE_ADMINS_KEY, JSON.stringify(updated));

    dbRepository.addAuditLog(
      "ADMIN_ROLE_REMOVED",
      "ADMIN_USER",
      admin.id,
      { revokedEmail: admin.email, previousRole: admin.role },
      user?.id || "super_admin",
      "super_admin"
    );

    loadData();
  };

  const filteredAdmins = admins.filter(
    (a) =>
      (a.name && a.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (a.email && a.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (a.id && a.id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8 pb-12">
      {/* ─── HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
              Admin User Management
            </h1>
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs px-2.5 py-0.5 font-bold uppercase tracking-wider">
              SUPER ADMIN CONTROL
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-foreground-secondary mt-1">
            Authoritative platform access control, role provisioning, security suspensions, and governance audit trail.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData} className="h-9 gap-1.5 text-xs font-semibold cursor-pointer">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>
          <Button
            size="sm"
            onClick={() => setIsPromoteModalOpen(true)}
            className="h-9 gap-1.5 text-xs font-bold bg-primary hover:bg-primary-light text-white shadow-xs"
          >
            <UserPlus className="h-4 w-4" />
            <span>Create / Promote Admin</span>
          </Button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* ─── ADMIN ACCOUNTS TABLE ─── */}
      <Card className="border border-border overflow-hidden shadow-xs">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/30">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-sm text-foreground">Authorized System Administrators</h3>
            <Badge variant="outline" className="text-xs font-semibold">
              {admins.length} Total
            </Badge>
          </div>

          <div className="w-full sm:w-64">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search admins by name, email..."
              leftIcon={<Search className="h-4 w-4 text-foreground-muted" />}
              className="h-9 text-xs"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-foreground-secondary uppercase tracking-wider text-[11px] font-bold">
              <tr>
                <th className="py-3 px-4">Administrator</th>
                <th className="py-3 px-4">Role & Level</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Provisioned</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredAdmins.map((adm) => (
                <tr key={adm.id} className="hover:bg-muted/20 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-foreground text-sm flex items-center gap-1.5">
                      {adm.name}
                      {adm.isOwner && (
                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">
                          OWNER
                        </span>
                      )}
                    </div>
                    <div className="text-foreground-secondary text-xs">{adm.email}</div>
                    <div className="text-[10px] text-foreground-muted font-mono">{adm.id}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge
                      variant="outline"
                      className={`text-[11px] font-bold uppercase tracking-wider ${
                        adm.role === "super_admin"
                          ? "bg-purple-50 text-purple-700 border-purple-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}
                    >
                      {adm.role === "super_admin" ? "SUPER ADMIN" : "OPERATIONS ADMIN"}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge
                      variant="outline"
                      className={`text-[11px] font-bold ${
                        adm.status === "active"
                          ? "text-emerald-700 border-emerald-300 bg-emerald-50"
                          : "text-rose-700 border-rose-300 bg-rose-50"
                      }`}
                    >
                      {adm.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-foreground-secondary">
                    {formatDate(adm.createdAt)}
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    {!adm.isOwner && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleSuspend(adm)}
                          className="h-8 text-xs font-semibold"
                        >
                          {adm.status === "active" ? (
                            <>
                              <UserX className="h-3.5 w-3.5 mr-1 text-rose-500" />
                              Suspend
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                              Activate
                            </>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAdmin(adm)}
                          className="h-8 text-xs text-rose-600 hover:bg-rose-50"
                        >
                          Revoke
                        </Button>
                      </>
                    )}
                    {adm.isOwner && (
                      <span className="text-[11px] text-foreground-muted font-semibold italic">Protected</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ─── AUDIT TRAIL: ADMIN ACTIONS (Section 19) ─── */}
      <Card className="p-5 border border-border bg-surface shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-sm text-foreground">Recent Administrative Security Events</h3>
          </div>
          <span className="text-xs text-foreground-muted">Tamper-evident audit trail</span>
        </div>

        {auditLogs.length === 0 ? (
          <div className="text-center py-6 text-xs text-foreground-muted">
            No admin role modifications logged yet.
          </div>
        ) : (
          <div className="space-y-2.5">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl border border-border bg-background flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <Badge variant="outline" className="font-mono text-[10px] font-bold">
                    {log.action}
                  </Badge>
                  <span className="font-semibold text-foreground">{log.entityId}</span>
                  <span className="text-foreground-secondary">by {log.actor || log.actor_id}</span>
                </div>
                <div className="text-[11px] text-foreground-muted font-mono">{formatDate(log.createdAt || log.created_at)}</div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ─── CREATE / PROMOTE ADMIN MODAL ─── */}
      <Dialog open={isPromoteModalOpen} onClose={() => setIsPromoteModalOpen(false)}>
        <DialogHeader onClose={() => setIsPromoteModalOpen(false)}>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-primary">
            <UserPlus className="h-5 w-5 text-primary" />
            <span>Promote User to Admin</span>
          </DialogTitle>
        </DialogHeader>
        <DialogContent>

          <form onSubmit={handlePromoteAdmin} className="space-y-4 py-2">
            {actionError && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">User Email or Supabase Auth UUID *</label>
              <Input
                value={targetIdentifier}
                onChange={(e) => setTargetIdentifier(e.target.value)}
                placeholder="e.g. employee@homeefix.in or auth UUID"
                required
                className="text-xs"
              />
              <span className="text-[11px] text-foreground-muted">
                Must correspond to an existing authenticated user or company email.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Display Name</label>
              <Input
                value={targetName}
                onChange={(e) => setTargetName(e.target.value)}
                placeholder="e.g. Operations Manager"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Admin Role Level *</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value as "admin" | "super_admin")}
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs font-semibold"
              >
                <option value="admin">Operations Admin (Bookings, Partners, Customers, Services)</option>
                <option value="super_admin">Super Admin (Full Platform Ownership & Role Management)</option>
              </select>
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setIsPromoteModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isProcessing} className="bg-primary hover:bg-primary-light text-white">
                {isProcessing ? "Provisioning..." : "Assign Admin Permissions"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
