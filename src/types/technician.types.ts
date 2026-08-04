import type { BaseEntity, GeoLocation, MediaFile } from "./common.types";

/* ─── Technician Status ─── */

export type TechnicianStatus = "available" | "busy" | "offline" | "on_leave";

/* ─── Verification Status ─── */

export type VerificationStatus = "pending" | "verified" | "rejected" | "expired";

/* ─── Technician ─── */

export interface Technician extends BaseEntity {
  userId: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  phone: string;
  email: string;

  // Professional
  status: TechnicianStatus;
  serviceCategories: string[];
  specializations: string[];
  experience: number; // years
  certifications: TechnicianCertification[];

  // Verification
  verificationStatus: VerificationStatus;
  idProof?: MediaFile;
  addressProof?: MediaFile;
  backgroundCheckStatus: VerificationStatus;

  // Location
  location?: GeoLocation;
  serviceRadius: number; // km
  serviceAreas: string[];

  // Performance
  rating: number;
  reviewCount: number;
  completedJobs: number;
  cancellationRate: number;
  responseTime: number; // minutes avg

  // Availability
  availability: TechnicianAvailability[];
  isAcceptingJobs: boolean;
}

/* ─── Technician Certification ─── */

export interface TechnicianCertification {
  name: string;
  issuedBy: string;
  issuedDate: string;
  expiryDate?: string;
  document?: MediaFile;
  isVerified: boolean;
}

/* ─── Technician Availability ─── */

export interface TechnicianAvailability {
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  isAvailable: boolean;
}

/* ─── Technician Review ─── */

export interface TechnicianReview extends BaseEntity {
  technicianId: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  bookingId: string;
  serviceName: string;
  rating: number;
  comment: string;
  images?: MediaFile[];
  reply?: string;
  repliedAt?: string;
}

/* ─── Technician Earnings ─── */

export interface TechnicianEarnings {
  totalEarnings: number;
  currentMonthEarnings: number;
  pendingPayouts: number;
  lastPayoutDate?: string;
  lastPayoutAmount?: number;
}

/* ─── Technician Dashboard Stats ─── */

export interface TechnicianDashboardStats {
  todayJobs: number;
  weeklyJobs: number;
  monthlyJobs: number;
  pendingRequests: number;
  rating: number;
  earnings: TechnicianEarnings;
}
