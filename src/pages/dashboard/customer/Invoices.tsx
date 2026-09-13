import { useState, useEffect } from "react";
import { Download, FileText, CheckCircle2, Search, Printer, X, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { dbRepository } from "@/services/db/repository";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import { useAuthStore } from "@/store/auth.store";

export default function Invoices() {
  const { user } = useAuthStore();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeInvoiceModal, setActiveInvoiceModal] = useState<any | null>(null);

  useEffect(() => {
    setInvoices(dbRepository.getInvoices(user?.id));
  }, [user?.id]);

  const filtered = invoices.filter(
    (inv) =>
      inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.serviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.bookingNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-primary">
            Digital GST Tax Invoices
          </h1>
          <p className="text-xs text-foreground-secondary mt-1">
            Official GST-compliant tax invoices for all completed and paid home services
          </p>
        </div>
      </div>

      {/* Search Filter */}
      <div className="max-w-md">
        <Input
          placeholder="Search by Invoice # or Service name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Invoices List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card className="rounded-2xl border border-dashed border-border p-12 text-center space-y-2 bg-surface">
            <FileText className="mx-auto h-10 w-10 text-foreground-muted" />
            <h3 className="font-heading text-sm font-bold text-primary">No Invoices Available</h3>
            <p className="text-xs text-foreground-secondary max-w-sm mx-auto">
              Official digital tax invoices are generated automatically once a service is completed and payment is settled.
            </p>
          </Card>
        ) : (
          filtered.map((inv) => (
            <div
              key={inv.id}
              className="rounded-2xl border border-border bg-surface p-5 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="h-10 w-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0 mt-0.5">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-primary font-mono">{inv.invoiceNumber}</span>
                    {inv.isDevSeed && (
                      <Badge variant="outline" className="text-[9px] px-1 py-0 border-amber-300 bg-amber-50 text-amber-800">
                        DEV SEED
                      </Badge>
                    )}
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> {inv.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-primary">{inv.serviceName}</h4>
                  <p className="text-xs text-foreground-muted">
                    Booking: <span className="font-mono text-primary font-medium">{inv.bookingNumber}</span> • {formatDate(inv.date)} • {inv.paymentMethod}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-0 pt-3 sm:pt-0">
                <span className="text-base font-extrabold text-accent">
                  {formatCurrency(inv.totalAmount)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 font-semibold"
                  onClick={() => setActiveInvoiceModal(inv)}
                >
                  <Download className="h-3.5 w-3.5" /> View & Print
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* PRINTABLE GST INVOICE MODAL */}
      {activeInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <Card className="w-full max-w-xl border border-border bg-surface p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-accent" />
                <h3 className="font-heading text-base font-bold text-primary">
                  Tax Invoice #{activeInvoiceModal.invoiceNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveInvoiceModal(null)}
                className="text-foreground-muted hover:text-primary font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Invoice Print Sheet */}
            <div className="p-6 rounded-xl border border-border bg-white text-slate-900 space-y-4 text-xs">
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <h2 className="font-heading text-lg font-extrabold text-slate-900">
                    Home-e-Fix Technologies Pvt. Ltd.
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Salt Lake Sector 1, Bidhannagar, Kolkata, WB 700064
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    GSTIN: 19AAACH7891K1Z2 | CIN: U72900WB2026PTC123456
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-xs font-mono font-bold text-slate-900 border-slate-300">
                    ORIGINAL FOR RECIPIENT
                  </Badge>
                  <p className="text-[11px] text-slate-500 mt-1">Date: {formatDate(activeInvoiceModal.date)}</p>
                </div>
              </div>

              {/* Billed To */}
              <div className="grid grid-cols-2 gap-4 py-2 border-b border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Billed To
                  </span>
                  <p className="font-bold text-slate-800 text-xs">{activeInvoiceModal.customerName}</p>
                  <p className="text-[11px] text-slate-600">Salt Lake Sector 1, Kolkata, West Bengal</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Service Reference
                  </span>
                  <p className="font-mono text-slate-800 font-bold">{activeInvoiceModal.bookingNumber}</p>
                  <p className="text-[11px] text-slate-600">Payment: {activeInvoiceModal.paymentMethod} (PAID)</p>
                </div>
              </div>

              {/* Table */}
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="py-2">Description</th>
                    <th className="py-2">SAC Code</th>
                    <th className="py-2 text-right">Taxable Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2.5 font-medium text-slate-900">{activeInvoiceModal.serviceName}</td>
                    <td className="py-2.5 font-mono text-slate-600">998719</td>
                    <td className="py-2.5 text-right font-medium">{formatCurrency(activeInvoiceModal.subtotal)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-medium text-slate-900">Safety, Sanitation & Convenience Fee</td>
                    <td className="py-2 font-mono text-slate-600">998719</td>
                    <td className="py-2 text-right font-medium">{formatCurrency(activeInvoiceModal.safetyFee || 49)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-slate-600">Central GST (CGST 9%)</td>
                    <td className="py-2 font-mono text-slate-600">—</td>
                    <td className="py-2 text-right font-medium">{formatCurrency(Math.round((activeInvoiceModal.taxGst || 53.82) / 2))}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-slate-600">State GST (SGST 9%)</td>
                    <td className="py-2 font-mono text-slate-600">—</td>
                    <td className="py-2 text-right font-medium">{formatCurrency(Math.round((activeInvoiceModal.taxGst || 53.82) / 2))}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="border-t border-slate-300 font-bold text-sm">
                    <td colSpan={2} className="py-3 text-slate-900">Total Invoice Amount (INR):</td>
                    <td className="py-3 text-right text-slate-900">{formatCurrency(activeInvoiceModal.totalAmount)}</td>
                  </tr>
                </tfoot>
              </table>

              <div className="pt-3 border-t border-slate-200 text-[10px] text-slate-500 space-y-1">
                <p>• This is a computer-generated tax invoice issued in accordance with GST Law and does not require physical signature.</p>
                <p>• Service covered under Home-e-Fix 30-Day Re-work Guarantee policy.</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setActiveInvoiceModal(null)}>
                Close
              </Button>
              <Button variant="accent" size="sm" onClick={() => window.print()} className="gap-1.5 font-bold">
                <Printer className="h-4 w-4" /> Print / Save PDF
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
