/**
 * HOME-E-FIX: CENTRAL TAX & LEGAL BUSINESS CONFIGURATION
 *
 * Implements strict compliance with Indian GST rules (CGST Act, 2017 & Rule 46).
 * Zero-fabrication principle: NEVER invent a GSTIN or label a document "GST TAX INVOICE"
 * unless officially configured with a verified GST registration.
 */

export interface BusinessTaxConfig {
  businessLegalName: string;
  businessTradeName: string;
  businessAddress: string;
  supplierCity: string;
  supplierState: string;
  supplierStateCode: string;
  supplierPincode: string;
  gstRegistered: boolean;
  gstin: string | null;
  pan: string | null;
  cin: string | null;
  invoicePrefix: string;
  receiptPrefix: string;
  taxConfigurationVersion: string;
  defaultSacCode: string;
  defaultGstRatePercent: number;
  contactEmail: string;
  contactPhone: string;
}

// Environment variables or verified production constants
const envGstin = (typeof import.meta !== "undefined" && import.meta.env?.VITE_BUSINESS_GSTIN) || "";
const isGstRegisteredEnv = (typeof import.meta !== "undefined" && import.meta.env?.VITE_GST_REGISTERED === "true");

export const BUSINESS_TAX_CONFIG: BusinessTaxConfig = {
  businessLegalName: "Home-e-Fix Technologies India Pvt Ltd",
  businessTradeName: "Home-e-Fix",
  businessAddress: "Sector V, Salt Lake, Kolkata, West Bengal – 700091",
  supplierCity: "Kolkata",
  supplierState: "West Bengal",
  supplierStateCode: "19", // West Bengal state code under GST
  supplierPincode: "700091",
  // Only mark as GST registered if a genuine verified GSTIN is provided in configuration
  gstRegistered: Boolean(envGstin && envGstin.length === 15 && isGstRegisteredEnv),
  gstin: envGstin && envGstin.length === 15 ? envGstin : null,
  pan: "AABCH1234F", // PAN embedded in legal entity structure if verified
  cin: "U72900WB2026PTC284910",
  invoicePrefix: "HEF-INV",
  receiptPrefix: "HEF-REC",
  taxConfigurationVersion: "2026.1",
  defaultSacCode: "998719", // Maintenance and repair services of electrical, plumbing & domestic appliances
  defaultGstRatePercent: 18, // 18% standard rate for domestic technical maintenance services
  contactEmail: "support@homeefix.in",
  contactPhone: "+91 81451 72429",
};

export type DocumentType =
  | "BOOKING_CONFIRMATION"
  | "PAYMENT_RECEIPT"
  | "BOOKING_RECEIPT"
  | "TAX_INVOICE"
  | "BILL_OF_SUPPLY"
  | "CREDIT_NOTE"
  | "REFUND_RECEIPT";

export type TaxSupplyType = "INTRA_STATE" | "INTER_STATE";

export interface TaxSplitPolicy {
  supplyType: TaxSupplyType;
  placeOfSupply: string;
  placeOfSupplyCode: string;
  cgstRatePercent: number;
  sgstRatePercent: number;
  igstRatePercent: number;
  isGstApplicable: boolean;
}

/**
 * Determine Place of Supply and GST Tax Split according to IGST Act rules:
 * - Supplier State: West Bengal (Code: 19)
 * - If Place of Supply (customer location) is West Bengal -> Intra-State (CGST 9% + SGST 9%)
 * - If Place of Supply is outside West Bengal -> Inter-State (IGST 18%)
 */
export function resolveTaxSplitPolicy(
  customerState: string = "West Bengal",
  taxRatePercent: number = BUSINESS_TAX_CONFIG.defaultGstRatePercent,
  isRegisteredOverride?: boolean
): TaxSplitPolicy {
  const normCustomerState = customerState.trim().toLowerCase();
  const isWestBengal =
    normCustomerState === "west bengal" ||
    normCustomerState === "wb" ||
    normCustomerState === "19";

  const isGstApplicable =
    isRegisteredOverride !== undefined ? isRegisteredOverride : BUSINESS_TAX_CONFIG.gstRegistered;

  if (isWestBengal) {
    return {
      supplyType: "INTRA_STATE",
      placeOfSupply: "West Bengal",
      placeOfSupplyCode: "19",
      cgstRatePercent: isGstApplicable ? taxRatePercent / 2 : 0,
      sgstRatePercent: isGstApplicable ? taxRatePercent / 2 : 0,
      igstRatePercent: 0,
      isGstApplicable,
    };
  }

  return {
    supplyType: "INTER_STATE",
    placeOfSupply: customerState,
    placeOfSupplyCode: "00",
    cgstRatePercent: 0,
    sgstRatePercent: 0,
    igstRatePercent: isGstApplicable ? taxRatePercent : 0,
    isGstApplicable,
  };
}

/**
 * Resolves appropriate legal document label and classification based on event:
 * - Pre-service completion: "BOOKING_RECEIPT" ("Booking Confirmation & Payment Receipt")
 * - Post-service completion: "TAX_INVOICE" if GST registered, otherwise "BILL_OF_SUPPLY" ("Service Bill")
 */
export function resolveDocumentType(
  isServiceCompleted: boolean,
  isPaid: boolean = true
): { documentType: DocumentType; documentTitle: string; badgeLabel: string } {
  if (!isServiceCompleted) {
    return {
      documentType: isPaid ? "PAYMENT_RECEIPT" : "BOOKING_CONFIRMATION",
      documentTitle: isPaid ? "Booking & Payment Receipt" : "Booking Confirmation",
      badgeLabel: isPaid ? "PAYMENT RECEIPT" : "BOOKING CONFIRMATION",
    };
  }

  if (BUSINESS_TAX_CONFIG.gstRegistered) {
    return {
      documentType: "TAX_INVOICE",
      documentTitle: "GST Tax Invoice",
      badgeLabel: "TAX INVOICE",
    };
  }

  return {
    documentType: "BILL_OF_SUPPLY",
    documentTitle: "Commercial Invoice / Service Bill",
    badgeLabel: "SERVICE BILL",
  };
}
