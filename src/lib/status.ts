/**
 * Canonical Status System for Home-e-Fix
 * Centralizes labels, descriptions, Lucide icons, semantic colors,
 * and badge variants across Customer, Professional, and Admin platforms.
 */

import {
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Truck,
  MapPin,
  Wrench,
  ShieldCheck,
  RotateCcw,
  FileCheck,
  UserCheck,
  FileText,
  DollarSign,
  type LucideIcon,
} from "lucide-react";
import type {
  BookingStatus,
  PaymentStatus,
  KYCStatus,
  TicketStatus,
  WarrantyStatus,
} from "@/types/database.types";

export interface StatusMeta {
  label: string;
  description: string;
  icon: LucideIcon;
  variant: "default" | "secondary" | "accent" | "outline" | "destructive";
  badgeClass: string;
  pillColor: string;
}

export const BOOKING_STATUS_CONFIG: Record<BookingStatus, StatusMeta> = {
  DRAFT: {
    label: "Draft",
    description: "Booking drafted but not yet placed",
    icon: Clock,
    variant: "outline",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
    pillColor: "#64748B",
  },
  PENDING_PAYMENT: {
    label: "Payment Pending",
    description: "Awaiting payment confirmation",
    icon: Clock,
    variant: "outline",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    pillColor: "#F59E0B",
  },
  PAYMENT_AUTHORIZED: {
    label: "Payment Authorized",
    description: "Payment pre-authorized and held in escrow",
    icon: Clock,
    variant: "secondary",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    pillColor: "#3B82F6",
  },
  PAYMENT_PROCESSING: {
    label: "Processing Payment",
    description: "Payment gateway verifying transaction",
    icon: Clock,
    variant: "outline",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    pillColor: "#3B82F6",
  },
  PAYMENT_FAILED: {
    label: "Payment Failed",
    description: "Transaction unsuccessful. Please retry.",
    icon: XCircle,
    variant: "destructive",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    pillColor: "#EF4444",
  },
  CONFIRMED: {
    label: "Order Confirmed",
    description: "Service request confirmed and queued for matching",
    icon: CheckCircle2,
    variant: "secondary",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pillColor: "#10B981",
  },
  SEARCHING_PROFESSIONAL: {
    label: "Finding Professional",
    description: "Locating highest-rated verified pro in your area",
    icon: Clock,
    variant: "accent",
    badgeClass: "bg-orange-50 text-orange-700 border-orange-200 animate-pulse",
    pillColor: "#FF6A00",
  },
  MATCHING: {
    label: "Matching Professional",
    description: "Locating highest-rated verified pro in your area",
    icon: Clock,
    variant: "accent",
    badgeClass: "bg-orange-50 text-orange-700 border-orange-200",
    pillColor: "#FF6A00",
  },
  ASSIGNMENT_PENDING: {
    label: "Dispatch Sent",
    description: "Job dispatched to matching professional",
    icon: Clock,
    variant: "accent",
    badgeClass: "bg-orange-50 text-orange-700 border-orange-200",
    pillColor: "#FF6A00",
  },
  PROFESSIONAL_ASSIGNED: {
    label: "Pro Assigned",
    description: "Professional assigned and reviewing details",
    icon: UserCheck,
    variant: "secondary",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    pillColor: "#0284C7",
  },
  PROFESSIONAL_ACCEPTED: {
    label: "Job Accepted",
    description: "Professional accepted and scheduled appointment",
    icon: CheckCircle2,
    variant: "secondary",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pillColor: "#10B981",
  },
  PROFESSIONAL_ON_THE_WAY: {
    label: "On The Way",
    description: "Professional dispatched and travelling to your home",
    icon: Truck,
    variant: "accent",
    badgeClass: "bg-orange-50 text-orange-700 border-orange-200 animate-pulse",
    pillColor: "#FF6A00",
  },
  PROFESSIONAL_EN_ROUTE: {
    label: "On The Way",
    description: "Professional dispatched and travelling to your home",
    icon: Truck,
    variant: "accent",
    badgeClass: "bg-orange-50 text-orange-700 border-orange-200 animate-pulse",
    pillColor: "#FF6A00",
  },
  PROFESSIONAL_ARRIVED: {
    label: "Pro Arrived",
    description: "Professional arrived at customer doorstep",
    icon: MapPin,
    variant: "secondary",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
    pillColor: "#6366F1",
  },
  SERVICE_STARTED: {
    label: "In Progress",
    description: "Service started with OTP verification",
    icon: Wrench,
    variant: "secondary",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
    pillColor: "#0284C7",
  },
  SERVICE_PAUSED: {
    label: "Service Paused",
    description: "Work temporarily paused",
    icon: Clock,
    variant: "outline",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    pillColor: "#F59E0B",
  },
  NO_SHOW: {
    label: "No Show",
    description: "Party was unavailable during the scheduled window",
    icon: XCircle,
    variant: "destructive",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    pillColor: "#EF4444",
  },
  AWAITING_CUSTOMER_APPROVAL: {
    label: "Approval Needed",
    description: "Customer action requested",
    icon: AlertCircle,
    variant: "accent",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    pillColor: "#F59E0B",
  },
  ADDITIONAL_CHARGES_PENDING: {
    label: "Material Approval Pending",
    description: "Technician requested spare parts approval",
    icon: DollarSign,
    variant: "accent",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    pillColor: "#F59E0B",
  },
  ADDITIONAL_CHARGES_APPROVED: {
    label: "Materials Approved",
    description: "Customer approved additional materials",
    icon: CheckCircle2,
    variant: "secondary",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pillColor: "#10B981",
  },
  SERVICE_COMPLETED: {
    label: "Service Completed",
    description: "Work completed; awaiting customer sign-off",
    icon: CheckCircle2,
    variant: "secondary",
    badgeClass: "bg-teal-50 text-teal-700 border-teal-200",
    pillColor: "#14B8A6",
  },
  CUSTOMER_CONFIRMED: {
    label: "Customer Confirmed",
    description: "Customer confirmed satisfaction with work",
    icon: CheckCircle2,
    variant: "secondary",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pillColor: "#10B981",
  },
  INVOICE_GENERATED: {
    label: "Invoice Ready",
    description: "GST invoice generated and available for download",
    icon: FileText,
    variant: "secondary",
    badgeClass: "bg-slate-50 text-slate-700 border-slate-200",
    pillColor: "#64748B",
  },
  PAYMENT_COMPLETED: {
    label: "Paid",
    description: "Full payment settled",
    icon: CheckCircle2,
    variant: "secondary",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pillColor: "#10B981",
  },
  WARRANTY_ACTIVE: {
    label: "Warranty Active",
    description: "Covered under Home-e-Fix 30-Day Re-work Guarantee",
    icon: ShieldCheck,
    variant: "secondary",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pillColor: "#10B981",
  },
  REVIEW_PENDING: {
    label: "Review Pending",
    description: "Service complete; waiting for customer rating",
    icon: Clock,
    variant: "outline",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    pillColor: "#F59E0B",
  },
  COMPLETED: {
    label: "Completed",
    description: "Service completed, paid, and closed",
    icon: CheckCircle2,
    variant: "secondary",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pillColor: "#10B981",
  },
  CANCELLED: {
    label: "Cancelled",
    description: "Booking cancelled",
    icon: XCircle,
    variant: "destructive",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    pillColor: "#EF4444",
  },
  REFUND_PENDING: {
    label: "Refund Pending",
    description: "Refund initiated and processing to source",
    icon: RotateCcw,
    variant: "outline",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
    pillColor: "#8B5CF6",
  },
  REFUNDED: {
    label: "Refunded",
    description: "Refund successfully credited to customer",
    icon: CheckCircle2,
    variant: "secondary",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
    pillColor: "#8B5CF6",
  },
  DISPUTED: {
    label: "Disputed",
    description: "Under active investigation by trust & safety team",
    icon: AlertCircle,
    variant: "destructive",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-300",
    pillColor: "#D97706",
  },
};

export const KYC_STATUS_CONFIG: Record<KYCStatus, StatusMeta> = {
  DRAFT: {
    label: "Draft",
    description: "Document details saved as draft",
    icon: Clock,
    variant: "outline",
    badgeClass: "bg-slate-50 text-slate-700 border-slate-200",
    pillColor: "#64748B",
  },
  SUBMITTED: {
    label: "Submitted",
    description: "Documents submitted for review",
    icon: FileCheck,
    variant: "secondary",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    pillColor: "#0284C7",
  },
  UNDER_REVIEW: {
    label: "Under Review",
    description: "Verification team currently auditing identity records",
    icon: Clock,
    variant: "accent",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    pillColor: "#F59E0B",
  },
  CHANGES_REQUIRED: {
    label: "Changes Required",
    description: "Clearer copy of identity certificate required",
    icon: AlertCircle,
    variant: "destructive",
    badgeClass: "bg-orange-50 text-orange-700 border-orange-200",
    pillColor: "#FF6A00",
  },
  APPROVED: {
    label: "Verified Pro",
    description: "Aadhaar, Police clearance, and Bank verified",
    icon: ShieldCheck,
    variant: "secondary",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pillColor: "#10B981",
  },
  REJECTED: {
    label: "Rejected",
    description: "Identity verification failed compliance requirements",
    icon: XCircle,
    variant: "destructive",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    pillColor: "#EF4444",
  },
  SUSPENDED: {
    label: "Suspended",
    description: "Partner account suspended pending investigation",
    icon: AlertCircle,
    variant: "destructive",
    badgeClass: "bg-red-100 text-red-800 border-red-300",
    pillColor: "#DC2626",
  },
};

export function getBookingStatusMeta(status: string): StatusMeta {
  const normalized = status.toUpperCase().replace(/\s+/g, "_") as BookingStatus;
  return BOOKING_STATUS_CONFIG[normalized] || {
    label: status.replace(/_/g, " "),
    description: "",
    icon: Clock,
    variant: "outline",
    badgeClass: "bg-slate-50 text-slate-700 border-slate-200",
    pillColor: "#64748B",
  };
}

export function getStatusConfig(status: string) {
  const meta = getBookingStatusMeta(status);
  return {
    label: meta.label,
    icon: meta.icon,
    badgeColor: meta.badgeClass,
    description: meta.description,
  };
}

