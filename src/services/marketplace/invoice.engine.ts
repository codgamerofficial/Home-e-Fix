import type { DigitalInvoice } from "@/types/marketplace.types";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/date";

export interface InvoiceGenerationInput {
  bookingId: string;
  bookingNumber: string;
  bookingDate: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  serviceName: string;
  technicianName?: string;
  subtotal: number;
  safetyFee?: number;
  discountAmount?: number;
  paymentMethod: string;
  paymentStatus: string;
  warrantyDays: number;
}

export const invoiceEngine = {
  generate(input: InvoiceGenerationInput): DigitalInvoice {
    const subtotal = Math.max(0, input.subtotal);
    const safetyFee = input.safetyFee || 29;
    const discount = Math.max(0, input.discountAmount || 0);

    const taxableAmount = Math.max(0, subtotal - discount + safetyFee);
    const cgstAmount = Math.round(taxableAmount * 0.09);
    const sgstAmount = Math.round(taxableAmount * 0.09);
    const totalAmount = taxableAmount + cgstAmount + sgstAmount;

    const year = new Date().getFullYear();
    const cleanId = input.bookingNumber.replace(/[^A-Z0-9]/gi, "").slice(-6).toUpperCase();
    const invoiceNumber = `HEF-INV-${year}-${cleanId}`;

    return {
      invoiceNumber,
      bookingNumber: input.bookingNumber,
      bookingDate: formatDate(input.bookingDate),
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      customerAddress: input.customerAddress,
      serviceName: input.serviceName,
      technicianName: input.technicianName || "Home-e-Fix Verified Partner",
      taxableAmount,
      cgstAmount,
      sgstAmount,
      safetyFee,
      discountAmount: discount,
      totalAmount,
      paymentMethod: input.paymentMethod,
      paymentStatus: input.paymentStatus,
      warrantyCoverage: `${input.warrantyDays} Days Home-e-Fix Workmanship Assurance`,
      gstinBusiness: "19AABCH1234F1Z5", // Home-e-Fix West Bengal GSTIN
    };
  },
};
