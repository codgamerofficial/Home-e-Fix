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
  { label: "Bookings", href: ROUTES.CUSTOMER_BOOKINGS, icon: CalendarCheck },
  { label: "Profile", href: ROUTES.CUSTOMER_PROFILE, icon: User },
  { label: "More", href: "#more", icon: MoreHorizontal },
];

/* ─── Customer Sidebar Navigation ─── */

export const CUSTOMER_SIDEBAR_LINKS: NavLink[] = [
  {
    label: "Dashboard",
    href: ROUTES.CUSTOMER_DASHBOARD,
    icon: LayoutDashboard,
  },
  { label: "My Bookings", href: ROUTES.CUSTOMER_BOOKINGS, icon: ClipboardList },
  { label: "Addresses", href: ROUTES.CUSTOMER_ADDRESSES, icon: MapPin },
  { label: "Wallet", href: ROUTES.CUSTOMER_WALLET, icon: Wallet },
  { label: "Profile", href: ROUTES.CUSTOMER_PROFILE, icon: UserCog },
  { label: "Support", href: ROUTES.CUSTOMER_SUPPORT, icon: HelpCircle },
];

/* ─── Technician Sidebar Navigation ─── */

export const TECHNICIAN_SIDEBAR_LINKS: NavLink[] = [
  {
    label: "Dashboard",
    href: ROUTES.TECHNICIAN_DASHBOARD,
    icon: LayoutDashboard,
  },
  { label: "My Jobs", href: ROUTES.TECHNICIAN_JOBS, icon: ClipboardList },
  { label: "Schedule", href: ROUTES.TECHNICIAN_SCHEDULE, icon: Calendar },
  { label: "Earnings", href: ROUTES.TECHNICIAN_EARNINGS, icon: DollarSign },
  { label: "Reviews", href: ROUTES.TECHNICIAN_REVIEWS, icon: Star },
  { label: "Profile", href: ROUTES.TECHNICIAN_PROFILE, icon: UserCog },
];

/* ─── Admin Sidebar Navigation ─── */

export const ADMIN_SIDEBAR_LINKS: NavLink[] = [
  { label: "Dashboard", href: ROUTES.ADMIN_DASHBOARD, icon: LayoutDashboard },
  { label: "Users", href: ROUTES.ADMIN_USERS, icon: Users },
  { label: "Services", href: ROUTES.ADMIN_SERVICES, icon: Wrench },
  { label: "Bookings", href: ROUTES.ADMIN_BOOKINGS, icon: ClipboardList },
  {
    label: "Technicians",
    href: ROUTES.ADMIN_TECHNICIANS,
    icon: UserCog,
  },
  { label: "Analytics", href: ROUTES.ADMIN_ANALYTICS, icon: BarChart3 },
  { label: "Settings", href: ROUTES.ADMIN_SETTINGS, icon: Settings },
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
