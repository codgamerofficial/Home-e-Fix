import {
  Home,
  Wrench,
  CalendarCheck,
  User,
  MoreHorizontal,
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
  type LucideIcon,
} from "lucide-react";
import { ROUTES } from "./routes";

/* ─── Navigation Link Type ─── */

export interface NavLink {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  children?: NavLink[];
}

/* ─── Main Navigation (Header) ─── */

export const MAIN_NAV_LINKS: NavLink[] = [
  { label: "Home", href: ROUTES.HOME, icon: Home },
  { label: "Services", href: ROUTES.SERVICES, icon: Wrench },
  { label: "About", href: ROUTES.ABOUT, icon: HelpCircle },
  { label: "Contact", href: ROUTES.CONTACT, icon: MapPin },
];

/* ─── Mobile Bottom Navigation ─── */

export const MOBILE_NAV_LINKS: NavLink[] = [
  { label: "Home", href: ROUTES.HOME, icon: Home },
  { label: "Services", href: ROUTES.SERVICES, icon: Wrench },
  { label: "Bookings", href: "/dashboard/orders", icon: CalendarCheck },
  { label: "Profile", href: "/dashboard/profile", icon: User },
  { label: "More", href: "#more", icon: MoreHorizontal },
];

/* ─── Customer Sidebar Navigation ─── */

export const CUSTOMER_SIDEBAR_LINKS: NavLink[] = [
  { label: "Orders", href: "/dashboard/orders", icon: ClipboardList },
  { label: "Wallet", href: "/dashboard/wallet", icon: Wallet },
  { label: "Membership", href: "/dashboard/membership", icon: Award },
  { label: "Coupons", href: "/dashboard/coupons", icon: Tag },
  { label: "Addresses", href: "/dashboard/addresses", icon: MapPin },
  { label: "My Reviews", href: "/dashboard/reviews", icon: Star },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell, badge: "2" },
  { label: "Profile", href: "/dashboard/profile", icon: UserCog },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
  { label: "Help Center", href: "/dashboard/help", icon: HelpCircle },
];

/* ─── Technician Sidebar Navigation ─── */

export const TECHNICIAN_SIDEBAR_LINKS: NavLink[] = [
  { label: "My Jobs", href: "/technician/jobs", icon: ClipboardList },
  { label: "Earnings", href: "/technician/earnings", icon: DollarSign },
  { label: "Wallet & Cash", href: "/technician/wallet", icon: Wallet },
  { label: "Ratings & Badges", href: "/technician/ratings", icon: Star },
  { label: "Availability", href: "/technician/availability", icon: UserCog },
  { label: "Spare Inventory", href: "/technician/inventory", icon: Wrench },
  { label: "Attendance", href: "/technician/attendance", icon: CalendarCheck },
];

/* ─── Admin Sidebar Navigation ─── */

export const ADMIN_SIDEBAR_LINKS: NavLink[] = [
  { label: "Analytics Overview", href: "/admin/analytics", icon: BarChart3 },
  { label: "Customer CRM", href: "/admin/customers", icon: Users },
  { label: "Technician Queue", href: "/admin/technicians", icon: UserCog },
  { label: "Master Bookings", href: "/admin/bookings", icon: ClipboardList },
  { label: "Payments & Payouts", href: "/admin/payments", icon: DollarSign },
  { label: "Coupons CMS", href: "/admin/coupons", icon: Tag },
  { label: "Membership CMS", href: "/admin/membership", icon: Award },
  { label: "Services CMS", href: "/admin/services", icon: Wrench },
  { label: "Reports & Export", href: "/admin/reports", icon: Settings },
];

/* ─── Footer Links ─── */

export interface FooterSection {
  title: string;
  links: { label: string; href: string }[];
}

export const FOOTER_SECTIONS: FooterSection[] = [
  {
    title: "Company",
    links: [
      { label: "About Us", href: ROUTES.ABOUT },
      { label: "Contact", href: ROUTES.CONTACT },
      { label: "Careers", href: "#" },
      { label: "Blog", href: "#" },
    ],
  },
  {
    title: "For Customers",
    links: [
      { label: "Browse Services", href: ROUTES.SERVICES },
      { label: "How It Works", href: "#" },
      { label: "Pricing", href: "#" },
      { label: "FAQ", href: "#" },
    ],
  },
  {
    title: "For Professionals",
    links: [
      { label: "Join as Technician", href: ROUTES.REGISTER },
      { label: "Partner Resources", href: "#" },
      { label: "Training", href: "#" },
      { label: "Support", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service", href: ROUTES.TERMS },
      { label: "Privacy Policy", href: ROUTES.PRIVACY },
      { label: "Refund Policy", href: "#" },
      { label: "Cookie Policy", href: "#" },
    ],
  },
];
