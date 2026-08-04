import type { BaseEntity, MediaFile } from "./common.types";

/* ─── Price Type ─── */

export type PriceType = "fixed" | "hourly" | "per_unit" | "starting_at";

/* ─── Service Category ─── */

export interface ServiceCategory extends BaseEntity {
  name: string;
  slug: string;
  description: string;
  icon: string;
  image?: string;
  parentId?: string;
  isActive: boolean;
  sortOrder: number;
  serviceCount: number;
}

/* ─── Service ─── */

export interface Service extends BaseEntity {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  categoryId: string;
  category?: ServiceCategory;
  priceType: PriceType;
  basePrice: number;
  discountedPrice?: number;
  duration: number; // minutes
  images: MediaFile[];
  thumbnail?: string;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  isPopular: boolean;
  isFeatured: boolean;
  tags: string[];
  includes: string[];
  excludes: string[];
  faqs: ServiceFAQ[];
}

/* ─── Service Package ─── */

export interface ServicePackage extends BaseEntity {
  name: string;
  description: string;
  serviceId: string;
  services: Service[];
  originalPrice: number;
  packagePrice: number;
  discount: number; // percentage
  validUntil?: string;
  isActive: boolean;
}

/* ─── Service FAQ ─── */

export interface ServiceFAQ {
  question: string;
  answer: string;
}

/* ─── Service Review ─── */

export interface ServiceReview extends BaseEntity {
  serviceId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  images?: MediaFile[];
  isVerified: boolean;
  helpfulCount: number;
}

/* ─── Service Filters ─── */

export interface ServiceFilters {
  categoryId?: string;
  priceRange?: [number, number];
  rating?: number;
  sortBy?: "price_low" | "price_high" | "rating" | "popularity" | "newest";
  search?: string;
}
