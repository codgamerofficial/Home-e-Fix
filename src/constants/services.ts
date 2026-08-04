/**
 * Service category definitions used for UI rendering.
 * These mirror what would come from the database.
 */
export const SERVICE_CATEGORIES = [
  {
    id: "plumbing",
    name: "Plumbing",
    slug: "plumbing",
    icon: "🔧",
    description: "Pipe repairs, leaks, bathroom fitting, and more",
    color: "#3B82F6",
  },
  {
    id: "electrical",
    name: "Electrical",
    slug: "electrical",
    icon: "⚡",
    description: "Wiring, switches, fans, MCB, and electrical repairs",
    color: "#F59E0B",
  },
  {
    id: "cleaning",
    name: "Cleaning",
    slug: "cleaning",
    icon: "🧹",
    description: "Deep cleaning, kitchen, bathroom, and full home",
    color: "#10B981",
  },
  {
    id: "painting",
    name: "Painting",
    slug: "painting",
    icon: "🎨",
    description: "Interior, exterior, waterproofing, and textures",
    color: "#8B5CF6",
  },
  {
    id: "carpentry",
    name: "Carpentry",
    slug: "carpentry",
    icon: "🪚",
    description: "Furniture repair, assembly, doors, and woodwork",
    color: "#D97706",
  },
  {
    id: "pest-control",
    name: "Pest Control",
    slug: "pest-control",
    icon: "🛡️",
    description: "Cockroach, termite, bed bugs, and ant treatment",
    color: "#EF4444",
  },
  {
    id: "appliance-repair",
    name: "Appliance Repair",
    slug: "appliance-repair",
    icon: "🔌",
    description: "AC, washing machine, refrigerator, and geyser repair",
    color: "#06B6D4",
  },
  {
    id: "home-renovation",
    name: "Home Renovation",
    slug: "home-renovation",
    icon: "🏗️",
    description: "Kitchen remodel, bathroom renovation, and interiors",
    color: "#EC4899",
  },
] as const;

/* ─── App Constants ─── */

export const APP_CONFIG = {
  name: "Home-e-Fix",
  tagline: "Fixing Homes. Earning Trust.",
  description:
    "Home-e-Fix is your trusted partner for all home services. Book verified professionals for plumbing, electrical, cleaning, painting, and more.",
  supportEmail: "support@homeefix.com",
  supportPhone: "+91 1800 123 4567",
  socialLinks: {
    facebook: "https://facebook.com/homeefix",
    instagram: "https://instagram.com/homeefix",
    twitter: "https://twitter.com/homeefix",
    linkedin: "https://linkedin.com/company/homeefix",
    youtube: "https://youtube.com/@homeefix",
  },
  playStoreLink: "#",
  appStoreLink: "#",
} as const;

/* ─── Booking ─── */

export const BOOKING_STATUSES = {
  pending: { label: "Pending", color: "warning" },
  confirmed: { label: "Confirmed", color: "info" },
  assigned: { label: "Assigned", color: "info" },
  in_progress: { label: "In Progress", color: "accent" },
  completed: { label: "Completed", color: "success" },
  cancelled: { label: "Cancelled", color: "error" },
  refunded: { label: "Refunded", color: "muted" },
} as const;

/* ─── Pagination Defaults ─── */

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 12,
  PAGE_SIZE_OPTIONS: [12, 24, 48, 96],
} as const;
