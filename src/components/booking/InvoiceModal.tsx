import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Printer, ShieldCheck, CheckCircle2, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/shared/Logo";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import type { NormalizedBookingConfirmation } from "@/hooks/useBookingConfirmation";

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingData: NormalizedBookingConfirmation;
}

export function InvoiceModal({ isOpen, onClose, bookingData }: InvoiceModalProps) {
  if (!isOpen) return null;

  const {
    bookingNumber,
    status,
    service,
    customer,
    addressSnapshot,
    scheduled,
    payment,
    professional,
    warranty,
    invoice,
  } = bookingData;

  const handlePrint = () => {
    window.print();
  };

  const invoiceNumber = invoice?.invoiceNumber || `HEF-INV-2026-${bookingNumber.replace(/[^0-9A-Z]/gi, "").slice(-6)}`;
  const sacCode = "998719"; // Maintenance and repair services of domestic electrical/plumbing appliances
  const gstin = invoice?.gstinBusiness || "19AABCH1234F1Z5";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-3xl rounded-2xl bg-white text-slate-900 shadow-2xl border border-slate-200 overflow-hidden my-auto"
        >
          {/* Modal Toolbar (hidden in print) */}
          <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#FF6A00]" />
              <span className="font-heading font-bold text-sm text-slate-900">
                GST Tax Invoice — {invoiceNumber}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="gap-1.5 font-bold text-xs"
              >
                <Printer className="h-3.5 w-3.5" />
                Print / Save PDF
              </Button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
                aria-label="Close invoice preview"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Printable Invoice Document */}
          <div id="invoice-printable-document" className="p-6 sm:p-10 space-y-6 text-slate-900 bg-white">
            {/* Header / Brand & Metadata */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-200">
              <div className="space-y-1.5">
                <Logo size="md" textColor="dark" linkToHome={false} />
                <p className="text-[11px] font-bold tracking-wider text-[#FF6A00] uppercase">
                  Fixing Homes. Earning Trust.
                </p>
                <div className="text-[11px] text-slate-600 leading-relaxed max-w-xs">
                  <p className="font-semibold text-slate-800">Home-e-Fix Technologies India Pvt Ltd</p>
                  <p>Sector V, Salt Lake, Kolkata, West Bengal – 700091</p>
                  <p className="font-mono">GSTIN: {gstin} • West Bengal (19)</p>
                </div>
              </div>

              <div className="sm:text-right space-y-1">
                <Badge variant="outline" className="text-xs font-bold text-emerald-800 bg-emerald-50 border-emerald-300">
                  TAX INVOICE
                </Badge>
                <div className="pt-1">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Invoice Number</div>
                  <div className="font-mono font-bold text-sm text-slate-900">{invoiceNumber}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">Date of Issue</div>
                  <div className="text-xs text-slate-700 font-medium">{formatDate(new Date())}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">Booking Reference</div>
                  <div className="font-mono text-xs font-bold text-slate-900">{bookingNumber}</div>
                </div>
              </div>
            </div>

            {/* Billed To & Service Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-2 border-b border-slate-200 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Billed To (Customer)
                </span>
                <p className="font-bold text-slate-900 text-sm">{customer.name}</p>
                {customer.phone && <p className="text-slate-600">Phone: {customer.phone}</p>}
                {customer.email && <p className="text-slate-600">Email: {customer.email}</p>}
                <div className="mt-1.5 pt-1.5 border-t border-slate-100 text-slate-700 leading-snug">
                  <span className="font-semibold text-slate-800 block text-[11px]">Service Location:</span>
                  <p>{addressSnapshot.houseFlatFloor && `${addressSnapshot.houseFlatFloor}, `}{addressSnapshot.buildingSocietyName && `${addressSnapshot.buildingSocietyName}, `}{addressSnapshot.streetRoadName}</p>
                  <p>{addressSnapshot.areaLocality && `${addressSnapshot.areaLocality}, `}{addressSnapshot.city}, {addressSnapshot.state} – {addressSnapshot.pincode}</p>
                </div>
              </div>

              <div className="space-y-1 sm:text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Service & Appointment Details
                </span>
                <p className="font-bold text-slate-900 text-sm">{service.name}</p>
                <p className="text-slate-600">Scheduled: {scheduled.formattedFull}</p>
                <p className="text-slate-600">
                  Assigned Partner: {professional ? `${professional.name} (Verified)` : "Home-e-Fix Kolkata Verified Tradesman"}
                </p>
                <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-start sm:justify-end gap-2">
                  <span className="text-slate-600 font-medium">Payment Status:</span>
                  <span className="font-bold font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px]">
                    {payment.status} ({payment.method})
                  </span>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-300 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5">Item Description</th>
                    <th className="py-2.5 text-center">SAC Code</th>
                    <th className="py-2.5 text-right">Taxable Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="py-3 font-medium text-slate-900">
                      <div>{service.name}</div>
                      <div className="text-[11px] text-slate-500">Professional labor, tools, diagnosis and workmanship</div>
                    </td>
                    <td className="py-3 text-center font-mono text-slate-500">{sacCode}</td>
                    <td className="py-3 text-right font-medium text-slate-900">{formatCurrency(service.subtotal)}</td>
                  </tr>

                  <tr>
                    <td className="py-2.5 font-medium text-slate-900">
                      <div>Safety, Sanitation & Operational Platform Fee</div>
                      <div className="text-[11px] text-slate-500">Background verification, insurance & customer safety standards</div>
                    </td>
                    <td className="py-2.5 text-center font-mono text-slate-500">{sacCode}</td>
                    <td className="py-2.5 text-right font-medium text-slate-900">{formatCurrency(service.safetyFee)}</td>
                  </tr>

                  {service.discount > 0 && (
                    <tr className="text-emerald-700 font-medium">
                      <td className="py-2">Promotional Voucher / Member Discount</td>
                      <td className="py-2 text-center font-mono">—</td>
                      <td className="py-2 text-right">-{formatCurrency(service.discount)}</td>
                    </tr>
                  )}

                  <tr>
                    <td className="py-2 text-slate-600">Central GST (CGST 9%)</td>
                    <td className="py-2 text-center font-mono text-slate-400">—</td>
                    <td className="py-2 text-right text-slate-700">{formatCurrency(Math.round(service.taxGst / 2))}</td>
                  </tr>

                  <tr>
                    <td className="py-2 text-slate-600">State GST (SGST 9% – West Bengal)</td>
                    <td className="py-2 text-center font-mono text-slate-400">—</td>
                    <td className="py-2 text-right text-slate-700">{formatCurrency(Math.round(service.taxGst / 2))}</td>
                  </tr>
                </tbody>

                <tfoot>
                  <tr className="border-t-2 border-slate-900 font-bold text-sm text-slate-950">
                    <td colSpan={2} className="py-3.5">
                      Total Invoice Amount (INR):
                    </td>
                    <td className="py-3.5 text-right text-base text-[#0B2341] font-mono">
                      {formatCurrency(payment.totalPayable)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Terms & Warranty Clause */}
            <div className="pt-4 border-t border-slate-200 text-[11px] text-slate-600 space-y-1.5 bg-slate-50 p-4 rounded-xl">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>{warranty.title} ({warranty.days} Days)</span>
              </div>
              <p className="text-[10px] leading-relaxed text-slate-500">
                • This service is backed by the Home-e-Fix 30-Day Workmanship Assurance guarantee across Kolkata. Any service dissatisfaction or rework required will be inspected and corrected at zero labor cost within the warranty window.
              </p>
              <p className="text-[10px] leading-relaxed text-slate-500">
                • This is a computer-generated tax invoice issued in accordance with Section 31 of the CGST Act, 2017. Physical signature is not required.
              </p>
            </div>
          </div>

          {/* Modal Bottom Bar (hidden in print) */}
          <div className="no-print flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close Preview
            </Button>
            <Button
              variant="accent"
              size="sm"
              onClick={handlePrint}
              className="gap-2 font-bold bg-[#FF6A00] hover:bg-[#E55F00] text-white"
            >
              <Download className="h-4 w-4" /> Download / Print Tax Invoice
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
