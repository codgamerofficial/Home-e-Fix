import {
  Home,
  Wrench,
  CalendarCheck,
  User,
  LayoutDashboard,
  ClipboardList,
  MapPin,
  Wallet,
  HelpCircle,
  Calendar,
  DollarSign,
  Star,
  UserCog,
  Users,
  Settings,
  BarChart3,
  Award,
  Tag,
  Bell,
  FileText,
  ShieldCheck,
  CheckCircle,
  FolderLock,
  Headphones,
  Sliders,
  Layers,
  Sparkles,
  Receipt,
  RotateCcw,
  MessageSquare,
  Activity,
  Briefcase,
  Server,
  Database,
  type LucideIcon,
} from "lucide-react";
import { ROUTES } from "./routes";

/* ─── Navigation Link Type ─── */
export interface NavLink {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  description?: string;
  children?: NavLink[];
}

/* ─── Main Navigation (Header - Section 9) ─── */
export const MAIN_NAV_LINKS: NavLink[] = [
  { label: "Services", href: ROUTES.SERVICES, icon: Wrench },
  { label: "How It Works", href: ROUTES.HOW_IT_WORKS, icon: Sparkles },
  { label: "Home-e-Fix PLUS", href: ROUTES.MEMBERSHIP, icon: Award },
  { label: "Become a Professional", href: ROUTES.BECOME_A_PROFESSIONAL, icon: Briefcase },
  { label: "Support", href: ROUTES.SUPPORT, icon: HelpCircle },
];

/* ─── Customer Mobile Bottom Navigation (Section 3: Home, Services, Bookings, PLUS, Account) ─── */
export const MOBILE_NAV_LINKS: NavLink[] = [
  { label: "Home", href: ROUTES.HOME, icon: Home },
  { label: "Services", href: ROUTES.SERVICES, icon: Wrench },
  { label: "Bookings", href: ROUTES.APP_BOOKINGS, icon: CalendarCheck },
  { label: "PLUS", href: ROUTES.APP_MEMBERSHIP, icon: Award },
  { label: "Account", href: ROUTES.APP_PROFILE, icon: User },
];

/* ─── Professional Mobile Bottom Navigation (Section 32: Jobs, Calendar, Earnings, Support, Profile) ─── */
export const PROFESSIONAL_MOBILE_NAV_LINKS: NavLink[] = [
  { label: "Jobs", href: ROUTES.PROFESSIONAL_JOBS, icon: ClipboardList },
  { label: "Calendar", href: ROUTES.PROFESSIONAL_CALENDAR, icon: Calendar },
  { label: "Earnings", href: ROUTES.PROFESSIONAL_EARNINGS, icon: DollarSign },
  { label: "Support", href: ROUTES.PROFESSIONAL_SUPPORT, icon: Headphones },
  { label: "Profile", href: ROUTES.PROFESSIONAL_PROFILE, icon: UserCog },
];

/* ─── Customer Sidebar Navigation (/app/* - Section 44) ─── */
export const CUSTOMER_SIDEBAR_LINKS: NavLink[] = [
  { label: "My Bookings", href: ROUTES.APP_BOOKINGS, icon: ClipboardList },
  { label: "Digital Invoices", href: ROUTES.APP_INVOICES, icon: Receipt },
  { label: "Wallet & Cash", href: ROUTES.APP_WALLET, icon: Wallet },
  { label: "Home-e-Fix PLUS", href: ROUTES.APP_MEMBERSHIP, icon: Award },
  { label: "Coupons & Offers", href: ROUTES.APP_COUPONS, icon: Tag },
  { label: "Saved Addresses", href: ROUTES.APP_ADDRESSES, icon: MapPin },
  { label: "Ratings & Reviews", href: ROUTES.APP_REVIEWS, icon: Star },
  { label: "Notifications", href: ROUTES.APP_NOTIFICATIONS, icon: Bell },
  { label: "Customer Support", href: ROUTES.APP_SUPPORT, icon: HelpCircle },
  { label: "Profile", href: ROUTES.APP_PROFILE, icon: UserCog },
  { label: "Settings", href: ROUTES.APP_SETTINGS, icon: Settings },
];

/* ─── Professional Sidebar Navigation (/professional/* - Section 45) ─── */
export const PROFESSIONAL_SIDEBAR_LINKS: NavLink[] = [
  { label: "My Jobs", href: ROUTES.PROFESSIONAL_JOBS, icon: ClipboardList },
  { label: "Service Calendar", href: ROUTES.PROFESSIONAL_CALENDAR, icon: Calendar },
  { label: "Earnings & Payouts", href: ROUTES.PROFESSIONAL_EARNINGS, icon: DollarSign },
  { label: "Wallet & Cash", href: ROUTES.PROFESSIONAL_WALLET, icon: Wallet },
  { label: "Ratings & Reviews", href: ROUTES.PROFESSIONAL_RATINGS, icon: Star },
  { label: "KYC Verification", href: ROUTES.PROFESSIONAL_KYC, icon: ShieldCheck },
  { label: "Documents", href: ROUTES.PROFESSIONAL_DOCUMENTS, icon: FolderLock },
  { label: "Technician Support", href: ROUTES.PROFESSIONAL_SUPPORT, icon: Headphones },
  { label: "Profile & Skills", href: ROUTES.PROFESSIONAL_PROFILE, icon: UserCog },
  { label: "Settings", href: ROUTES.PROFESSIONAL_SETTINGS, icon: Settings },
];

// Alias for backwards-compatibility
export const TECHNICIAN_SIDEBAR_LINKS = PROFESSIONAL_SIDEBAR_LINKS;

/* ─── Admin Sidebar Navigation (/admin/* - Section 46) ─── */
export const ADMIN_SIDEBAR_LINKS: NavLink[] = [
  { label: "Analytics Overview", href: ROUTES.ADMIN_ANALYTICS, icon: BarChart3 },
  { label: "Master Bookings", href: ROUTES.ADMIN_BOOKINGS, icon: ClipboardList },
  { label: "Customer CRM", href: ROUTES.ADMIN_CUSTOMERS, icon: Users },
  { label: "Verified Professionals", href: ROUTES.ADMIN_PROFESSIONALS, icon: UserCog },
  { label: "Services Catalogue", href: ROUTES.ADMIN_SERVICES, icon: Wrench },
  { label: "Service Categories", href: ROUTES.ADMIN_CATEGORIES, icon: Layers },
  { label: "Pricing Engine", href: ROUTES.ADMIN_PRICING, icon: Sliders },
  { label: "Payments & Payouts", href: ROUTES.ADMIN_PAYMENTS, icon: DollarSign },
  { label: "Refunds Management", href: ROUTES.ADMIN_REFUNDS, icon: RotateCcw },
  { label: "PLUS Membership", href: ROUTES.ADMIN_MEMBERSHIP, icon: Award },
  { label: "Coupons CMS", href: ROUTES.ADMIN_COUPONS, icon: Tag },
  { label: "Reviews Moderation", href: ROUTES.ADMIN_REVIEWS, icon: Star },
  { label: "Support Tickets", href: ROUTES.ADMIN_SUPPORT, icon: MessageSquare },
  { label: "Notifications Center", href: ROUTES.ADMIN_NOTIFICATIONS, icon: Bell },
  { label: "Content CMS", href: ROUTES.ADMIN_CMS, icon: FileText },
  { label: "Reports & Audit", href: ROUTES.ADMIN_REPORTS, icon: Activity },
  { label: "Audit Logs", href: ROUTES.ADMIN_AUDIT_LOGS, icon: FolderLock },
  { label: "Platform Settings", href: ROUTES.ADMIN_SETTINGS, icon: Settings },
  { label: "Integrations & APIs", href: ROUTES.ADMIN_INTEGRATIONS, icon: Server },
  { label: "Data Quality Matrix", href: ROUTES.ADMIN_DATA_QUALITY, icon: Database },
];

/* ─── Footer Links ─── */
export interface FooterSection {
  title: string;
  links: { label: string; href: string }[];
}

export const FOOTER_SECTIONS: FooterSection[] = [
  {
    title: "Services",
    links: [
      { label: "Electrical", href: `${ROUTES.SERVICES}/electrical` },
      { label: "Plumbing", href: `${ROUTES.SERVICES}/plumbing` },
      { label: "AC Services", href: `${ROUTES.SERVICES}/ac` },
      { label: "Deep Cleaning", href: `${ROUTES.SERVICES}/cleaning` },
      { label: "Carpentry", href: `${ROUTES.SERVICES}/carpentry` },
      { label: "View All Services", href: ROUTES.SERVICES },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: ROUTES.ABOUT },
      { label: "How It Works", href: ROUTES.HOW_IT_WORKS },
      { label: "Home-e-Fix PLUS", href: ROUTES.MEMBERSHIP },
      { label: "Become a Professional", href: ROUTES.BECOME_A_PROFESSIONAL },
      { label: "Careers", href: `${ROUTES.ABOUT}#careers` },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: ROUTES.SUPPORT },
      { label: "Contact Us", href: ROUTES.CONTACT },
      { label: "Cancellation Policy", href: `${ROUTES.TERMS}#cancellation` },
      { label: "Refund Policy", href: `${ROUTES.TERMS}#refund` },
      { label: "Service Warranty", href: `${ROUTES.HOW_IT_WORKS}#warranty` },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: ROUTES.PRIVACY },
      { label: "Terms of Service", href: ROUTES.TERMS },
      { label: "Cookie Policy", href: `${ROUTES.PRIVACY}#cookies` },
      { label: "Professional Agreement", href: `${ROUTES.BECOME_A_PROFESSIONAL}#agreement` },
    ],
  },
];
