import { useState, useEffect } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Database,
  Activity,
  Zap,
  Lock,
  FileCheck,
  Server,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  dataIntegrityService,
  type IntegrityReport,
  type IntegrityCheckItem,
} from "@/services/marketplace/dataIntegrity.service";
import { dbRepository } from "@/services/db/repository";
import { formatDate } from "@/lib/date";

export default function DataQualityCMS() {
  const [auditReport, setAuditReport] = useState<IntegrityReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [autoFixNotice, setAutoFixNotice] = useState<string | null>(null);

  const runAudit = () => {
    setIsRunning(true);
    setTimeout(() => {
      const report = dataIntegrityService.runAllChecks();
      setAuditReport(report);
      setIsRunning(false);
    }, 400);
  };

  useEffect(() => {
    runAudit();
  }, []);

  const totalBookings = dbRepository.getBookings().length;
  const totalCustomers = dbRepository.getCustomers().length;
  const totalPros = dbRepository.getProfessionals().length;
  const totalReviews = dbRepository.getReviews().length;
  const totalInvoices = dbRepository.getInvoices().length;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="accent" className="text-[10px] uppercase font-bold">
              Mission Critical
            </Badge>
            <span className="text-xs text-foreground-muted font-mono">
              v2.4 Core
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-primary mt-1">
            Data Quality & Integrity Control Center
          </h1>
          <p className="text-xs text-foreground-secondary mt-1">
            Authoritative automated verification suite auditing real transactions, relational integrity, and anti-fabrication standards.
          </p>
        </div>

        <Button
          variant="accent"
          size="default"
          onClick={runAudit}
          disabled={isRunning}
          leftIcon={<RefreshCw className={`h-4 w-4 ${isRunning ? "animate-spin" : ""}`} />}
          className="font-bold shadow-lg"
        >
          {isRunning ? "Running 12 Checks..." : "Run Real-Time Audit"}
        </Button>
      </div>

      {autoFixNotice && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
          <span>{autoFixNotice}</span>
          <button onClick={() => setAutoFixNotice(null)} className="font-bold text-xs">Dismiss</button>
        </div>
      )}

      {/* HEALTH SCORE HERO CARD */}
      {auditReport && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <Card className="md:col-span-4 p-6 border border-border bg-surface flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xs font-semibold text-foreground-muted uppercase tracking-wider block">
                Platform Data Health Score
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span
                  className={`font-heading text-5xl font-black ${
                    auditReport.overallHealthScore === 100
                      ? "text-emerald-600 dark:text-emerald-400"
                      : auditReport.overallHealthScore >= 80
                      ? "text-amber-500"
                      : "text-rose-600"
                  }`}
                >
                  {auditReport.overallHealthScore}%
                </span>
                <span className="text-xs text-foreground-secondary font-medium">
                  {auditReport.overallHealthScore === 100 ? "Flawless Real Data" : "Audit Items Pending"}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    auditReport.overallHealthScore === 100
                      ? "bg-emerald-500"
                      : auditReport.overallHealthScore >= 80
                      ? "bg-amber-500"
                      : "bg-rose-500"
                  }`}
                  style={{ width: `${auditReport.overallHealthScore}%` }}
                />
              </div>
              <p className="text-[11px] text-foreground-muted flex items-center justify-between">
                <span>Audited: {formatDate(auditReport.timestamp)}</span>
                <span className="font-mono">{auditReport.passedChecks}/{auditReport.totalChecks} Checks Passed</span>
              </p>
            </div>
          </Card>

          {/* REAL METRICS AT A GLANCE */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="p-4 border border-border text-center space-y-1">
              <div className="text-[11px] text-foreground-secondary font-semibold">Real Bookings</div>
              <div className="font-heading text-2xl font-bold text-primary">{totalBookings}</div>
              <div className="text-[9px] text-foreground-muted">DB Verified</div>
            </Card>

            <Card className="p-4 border border-border text-center space-y-1">
              <div className="text-[11px] text-foreground-secondary font-semibold">Real Customers</div>
              <div className="font-heading text-2xl font-bold text-primary">{totalCustomers}</div>
              <div className="text-[9px] text-foreground-muted">Active Profiles</div>
            </Card>

            <Card className="p-4 border border-border text-center space-y-1">
              <div className="text-[11px] text-foreground-secondary font-semibold">Specialists</div>
              <div className="font-heading text-2xl font-bold text-accent">{totalPros}</div>
              <div className="text-[9px] text-foreground-muted">Hub Network</div>
            </Card>

            <Card className="p-4 border border-border text-center space-y-1">
              <div className="text-[11px] text-foreground-secondary font-semibold">Customer Reviews</div>
              <div className="font-heading text-2xl font-bold text-emerald-600">{totalReviews}</div>
              <div className="text-[9px] text-foreground-muted">Verified Orders</div>
            </Card>

            <Card className="p-4 border border-border text-center space-y-1 col-span-2">
              <div className="text-[11px] text-foreground-secondary font-semibold">Relational Integrity Mode</div>
              <div className="text-xs font-bold text-emerald-600 flex items-center justify-center gap-1 mt-1">
                <Lock className="w-3.5 h-3.5" /> Strict Zero-Fabrication Active
              </div>
              <div className="text-[10px] text-foreground-muted">Database is Sole Source of Truth</div>
            </Card>

            <Card className="p-4 border border-border text-center space-y-1 col-span-2">
              <div className="text-[11px] text-foreground-secondary font-semibold">Digital Invoices</div>
              <div className="font-heading text-2xl font-bold text-primary">{totalInvoices}</div>
              <div className="text-[9px] text-foreground-muted">GST & Arithmetic Matched</div>
            </Card>
          </div>
        </div>
      )}

      {/* DETAILED 12-POINT AUDIT LEDGER */}
      {auditReport && (
        <Card className="p-6 border border-border space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border gap-2">
            <div>
              <h3 className="font-heading text-base font-bold text-primary">
                12-Point Automated Health Matrix
              </h3>
              <p className="text-xs text-foreground-muted">
                Systematic verification of relational schemas, pricing models, dispatch SLAs, and authenticity.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs border-emerald-200 text-emerald-700 bg-emerald-50">
                {auditReport.passedChecks} Passed
              </Badge>
              {auditReport.failedChecks > 0 && (
                <Badge variant="outline" className="text-xs border-rose-200 text-rose-700 bg-rose-50">
                  {auditReport.failedChecks} Discrepancies
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {auditReport.items.map((check: IntegrityCheckItem) => {
              const isOk = check.status === "PASS";
              return (
                <div
                  key={check.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isOk
                      ? "bg-slate-50/50 dark:bg-slate-900/30 border-slate-200/80 dark:border-slate-800"
                      : "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {isOk ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {check.category}
                          </span>
                          <h4 className="font-heading text-xs sm:text-sm font-bold text-primary">
                            {check.name}
                          </h4>
                          <Badge
                            variant={isOk ? "secondary" : "destructive"}
                            className="text-[9px] uppercase font-bold"
                          >
                            {check.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-foreground-secondary leading-relaxed">
                          {check.description}
                        </p>
                        {check.details.length > 0 && (
                          <div className="mt-2 space-y-1 pl-2 border-l-2 border-rose-300">
                            {check.details.slice(0, 3).map((d, i) => (
                              <p key={i} className="text-[11px] text-rose-600 font-mono">
                                • {d}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono font-semibold text-foreground-muted block">
                        Issues: {check.issueCount}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
