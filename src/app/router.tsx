import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router";
import { SearchProvider } from "../context/SearchContext";
import { CommandMenu } from "../components/shared/CommandMenu";
import { RootLayout } from "../layouts/RootLayout";
import { AuthLayout } from "../layouts/AuthLayout";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { ROUTES } from "../constants/routes";
import {
  CUSTOMER_SIDEBAR_LINKS,
  PROFESSIONAL_SIDEBAR_LINKS,
  ADMIN_SIDEBAR_LINKS,
} from "../constants/navigation";
import { PageSkeleton } from "../components/shared/LoadingSkeleton";
import { ProtectedRoute, RoleProtectedRoute, PublicOnlyRoute } from "../components/shared/ProtectedRoute";
import { RouteErrorBoundary } from "../components/shared/RouteErrorBoundary";

/* ─── Suspense Wrapper ─── */
function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageSkeleton />}>{children}</Suspense>;
}

/* ─── Lazy-loaded Public Pages (Section 43) ─── */
const Home = lazy(() => import("../pages/Home"));
const ServiceCatalog = lazy(() => import("../pages/services/ServiceCatalog"));
const CategoryDetail = lazy(() => import("../pages/services/CategoryDetail"));
const ServiceDetail = lazy(() => import("../pages/services/ServiceDetail"));
const HowItWorks = lazy(() => import("../pages/static/HowItWorks"));
const MembershipPublic = lazy(() => import("../pages/static/Membership"));
const About = lazy(() => import("../pages/static/About"));
const BecomeProfessional = lazy(() => import("../pages/static/BecomeProfessional"));
const Support = lazy(() => import("../pages/static/Support"));
const Contact = lazy(() => import("../pages/static/Contact"));
const Blog = lazy(() => import("../pages/static/Blog"));
const Privacy = lazy(() => import("../pages/static/Privacy"));
const Terms = lazy(() => import("../pages/static/Terms"));
const Cancellation = lazy(() => import("../pages/static/Cancellation"));
const Refund = lazy(() => import("../pages/static/Refund"));
const ProviderTerms = lazy(() => import("../pages/static/ProviderTerms"));
const DesignSystemShowcase = lazy(() => import("../pages/DesignSystemShowcase"));
const NotFound = lazy(() => import("../pages/NotFound"));
const ProfessionalOnboarding = lazy(() => import("../pages/professional/ProfessionalOnboarding"));

/* ─── Lazy-loaded Auth Pages ─── */
const Login = lazy(() => import("../pages/auth/Login"));
const Register = lazy(() => import("../pages/auth/Register"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));
const OtpVerification = lazy(() => import("../pages/auth/OtpVerification"));
const ProfileSetup = lazy(() => import("../pages/auth/ProfileSetup"));
const AuthCallback = lazy(() => import("../pages/auth/AuthCallback"));

/* ─── Lazy-loaded Customer App Pages (/app/* - Section 44) ─── */
const BookingWizard = lazy(() => import("../pages/booking/BookingWizard"));
const BookingConfirmed = lazy(() => import("../pages/booking/BookingConfirmed"));
const BookingDetail = lazy(() => import("../pages/booking/BookingDetail"));
const LiveTrackingView = lazy(() => import("../pages/booking/LiveTrackingView"));
const Orders = lazy(() => import("../pages/dashboard/customer/Orders"));
const Invoices = lazy(() => import("../pages/dashboard/customer/Invoices"));
const Wallet = lazy(() => import("../pages/dashboard/customer/Wallet"));
const Membership = lazy(() => import("../pages/dashboard/customer/Membership"));
const Coupons = lazy(() => import("../pages/dashboard/customer/Coupons"));
const Addresses = lazy(() => import("../pages/dashboard/customer/Addresses"));
const Reviews = lazy(() => import("../pages/dashboard/customer/Reviews"));
const Notifications = lazy(() => import("../pages/dashboard/customer/Notifications"));
const Profile = lazy(() => import("../pages/dashboard/customer/Profile"));
const Settings = lazy(() => import("../pages/dashboard/customer/Settings"));
const HelpCenter = lazy(() => import("../pages/dashboard/customer/HelpCenter"));

/* ─── Lazy-loaded Professional App Pages (/professional/* - Section 45) ─── */
const TechJobList = lazy(() => import("../pages/dashboard/technician/JobList"));
const TechJobDetail = lazy(() => import("../pages/dashboard/technician/JobDetail"));
const TechCalendar = lazy(() => import("../pages/dashboard/technician/Calendar"));
const TechEarnings = lazy(() => import("../pages/dashboard/technician/Earnings"));
const TechWallet = lazy(() => import("../pages/dashboard/technician/Wallet"));
const TechRatings = lazy(() => import("../pages/dashboard/technician/Ratings"));
const TechProfile = lazy(() => import("../pages/dashboard/technician/Profile"));
const TechKYC = lazy(() => import("../pages/dashboard/technician/KYC"));
const TechDocuments = lazy(() => import("../pages/dashboard/technician/Documents"));
const TechSupport = lazy(() => import("../pages/dashboard/technician/Support"));
const TechSettings = lazy(() => import("../pages/dashboard/technician/Settings"));
const TechInventory = lazy(() => import("../pages/dashboard/technician/Inventory"));
const TechAttendance = lazy(() => import("../pages/dashboard/technician/Attendance"));

/* ─── Lazy-loaded Admin Center Pages (/admin/* - Section 46) ─── */
const AdminAnalytics = lazy(() => import("../pages/dashboard/admin/Analytics"));
const AdminBookings = lazy(() => import("../pages/dashboard/admin/Bookings"));
const AdminCustomers = lazy(() => import("../pages/dashboard/admin/Customers"));
const AdminTechnicians = lazy(() => import("../pages/dashboard/admin/Technicians"));
const AdminServicesCMS = lazy(() => import("../pages/dashboard/admin/ServicesCMS"));
const AdminCategoriesCMS = lazy(() => import("../pages/dashboard/admin/CategoriesCMS"));
const AdminPricingCMS = lazy(() => import("../pages/dashboard/admin/PricingCMS"));
const AdminPayments = lazy(() => import("../pages/dashboard/admin/Payments"));
const AdminRefundsCMS = lazy(() => import("../pages/dashboard/admin/RefundsCMS"));
const AdminMembershipCMS = lazy(() => import("../pages/dashboard/admin/MembershipCMS"));
const AdminCouponsCMS = lazy(() => import("../pages/dashboard/admin/CouponsCMS"));
const AdminReviewsCMS = lazy(() => import("../pages/dashboard/admin/ReviewsCMS"));
const AdminSupportCMS = lazy(() => import("../pages/dashboard/admin/SupportTicketsCMS"));
const AdminNotificationsCMS = lazy(() => import("../pages/dashboard/admin/NotificationsCMS"));
const AdminContentCMS = lazy(() => import("../pages/dashboard/admin/ContentCMS"));
const AdminReports = lazy(() => import("../pages/dashboard/admin/Reports"));
const AdminAuditLogsCMS = lazy(() => import("../pages/dashboard/admin/AuditLogsCMS"));
const AdminSettingsCMS = lazy(() => import("../pages/dashboard/admin/SettingsCMS"));
const AdminLiveOperations = lazy(() => import("../pages/dashboard/admin/LiveOperations"));
const AdminSystemIntegrations = lazy(() => import("../pages/dashboard/admin/SystemIntegrations"));
const AdminDataQualityCMS = lazy(() => import("../pages/dashboard/admin/DataQualityCMS"));
const AdminDashboard = lazy(() => import("../pages/dashboard/admin/AdminDashboard"));
const AdminManagement = lazy(() => import("../pages/dashboard/admin/AdminManagement"));

/* ─── Router Configuration ─── */
export const router = createBrowserRouter([
  {
    errorElement: <RouteErrorBoundary />,
    element: (
      <SearchProvider>
        <Outlet />
        <CommandMenu />
      </SearchProvider>
    ),
    children: [
      {
        // Public routes wrapped in RootLayout
        element: <RootLayout />,
        children: [
      {
        path: ROUTES.HOME,
        element: (
          <LazyPage>
            <Home />
          </LazyPage>
        ),
      },
      {
        path: ROUTES.SERVICES,
        element: (
          <LazyPage>
            <ServiceCatalog />
          </LazyPage>
        ),
      },
      {
        path: "/services/:category",
        element: (
          <LazyPage>
            <CategoryDetail />
          </LazyPage>
        ),
      },
      {
        path: "/services/:category/:service",
        element: (
          <LazyPage>
            <ServiceDetail />
          </LazyPage>
        ),
      },
      {
        path: "/services/category/:categorySlug",
        element: (
          <LazyPage>
            <CategoryDetail />
          </LazyPage>
        ),
      },
      {
        path: ROUTES.HOW_IT_WORKS,
        element: (
          <LazyPage>
            <HowItWorks />
          </LazyPage>
        ),
      },
      {
        path: ROUTES.MEMBERSHIP,
        element: (
          <LazyPage>
            <MembershipPublic />
          </LazyPage>
        ),
      },
      {
        path: ROUTES.ABOUT,
        element: (
          <LazyPage>
            <About />
          </LazyPage>
        ),
      },
      {
        path: ROUTES.BECOME_A_PROFESSIONAL,
        element: (
          <LazyPage>
            <BecomeProfessional />
          </LazyPage>
        ),
      },
      {
        path: ROUTES.PROFESSIONAL_ONBOARDING,
        element: (
          <LazyPage>
            <ProfessionalOnboarding />
          </LazyPage>
        ),
      },
      {
        path: "/professional/onboarding",
        element: (
          <LazyPage>
            <ProfessionalOnboarding />
          </LazyPage>
        ),
      },
      {
        path: ROUTES.SUPPORT,
        element: (
          <LazyPage>
            <Support />
          </LazyPage>
        ),
      },
      {
        path: ROUTES.CONTACT,
        element: (
          <LazyPage>
            <Contact />
          </LazyPage>
        ),
      },
      {
        path: ROUTES.BLOG,
        element: (
          <LazyPage>
            <Blog />
          </LazyPage>
        ),
      },
      {
        path: ROUTES.PRIVACY,
        element: (
          <LazyPage>
            <Privacy />
          </LazyPage>
        ),
      },
      {
        path: ROUTES.TERMS,
        element: (
          <LazyPage>
            <Terms />
          </LazyPage>
        ),
      },
      {
        path: ROUTES.CANCELLATION,
        element: (
          <LazyPage>
            <Cancellation />
          </LazyPage>
        ),
      },
      {
        path: ROUTES.REFUND,
        element: (
          <LazyPage>
            <Refund />
          </LazyPage>
        ),
      },
      {
        path: ROUTES.PROVIDER_TERMS,
        element: (
          <LazyPage>
            <ProviderTerms />
          </LazyPage>
        ),
      },
      {
        path: ROUTES.DESIGN_SYSTEM,
        element: (
          <LazyPage>
            <DesignSystemShowcase />
          </LazyPage>
        ),
      },

      // Legacy direct booking paths
      {
        path: "/booking",
        element: (
          <LazyPage>
            <BookingWizard />
          </LazyPage>
        ),
      },
      {
        path: "/booking/confirmation/:bookingId",
        element: (
          <LazyPage>
            <BookingConfirmed />
          </LazyPage>
        ),
      },
      {
        path: "/bookings/:id/track",
        element: (
          <LazyPage>
            <LiveTrackingView />
          </LazyPage>
        ),
      },

      // 404 Catch-all
      {
        path: ROUTES.NOT_FOUND,
        element: (
          <LazyPage>
            <NotFound />
          </LazyPage>
        ),
      },
    ],
  },

  // Auth Routes wrapped in AuthLayout
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: (
          <PublicOnlyRoute>
            <LazyPage>
              <Login />
            </LazyPage>
          </PublicOnlyRoute>
        ),
      },
      {
        path: "register",
        element: (
          <LazyPage>
            <Register />
          </LazyPage>
        ),
      },
      {
        path: "forgot-password",
        element: (
          <LazyPage>
            <ForgotPassword />
          </LazyPage>
        ),
      },
      {
        path: "otp",
        element: (
          <LazyPage>
            <OtpVerification />
          </LazyPage>
        ),
      },
      {
        path: "profile-setup",
        element: (
          <LazyPage>
            <ProfileSetup />
          </LazyPage>
        ),
      },
      {
        path: "callback",
        element: (
          <LazyPage>
            <AuthCallback />
          </LazyPage>
        ),
      },
    ],
  },

  // ─── Customer Platform Routes (/app/* - Section 44) ───
  {
    path: "/app",
    errorElement: <RouteErrorBoundary />,
    element: (
      <ProtectedRoute>
        <RoleProtectedRoute allowedRoles={["CUSTOMER", "ADMIN", "SUPER_ADMIN"]}>
          <DashboardLayout links={CUSTOMER_SIDEBAR_LINKS} title="Customer Account" />
        </RoleProtectedRoute>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/app/bookings" replace />,
      },
      {
        path: "book",
        element: (
          <LazyPage>
            <BookingWizard />
          </LazyPage>
        ),
      },
      {
        path: "book/:service",
        element: (
          <LazyPage>
            <BookingWizard />
          </LazyPage>
        ),
      },
      {
        path: "bookings",
        element: (
          <LazyPage>
            <Orders />
          </LazyPage>
        ),
      },
      {
        path: "bookings/:id",
        element: (
          <LazyPage>
            <BookingDetail />
          </LazyPage>
        ),
      },
      {
        path: "bookings/:id/track",
        element: (
          <LazyPage>
            <LiveTrackingView />
          </LazyPage>
        ),
      },
      {
        path: "invoices",
        element: (
          <LazyPage>
            <Invoices />
          </LazyPage>
        ),
      },
      {
        path: "membership",
        element: (
          <LazyPage>
            <Membership />
          </LazyPage>
        ),
      },
      {
        path: "wallet",
        element: (
          <LazyPage>
            <Wallet />
          </LazyPage>
        ),
      },
      {
        path: "coupons",
        element: (
          <LazyPage>
            <Coupons />
          </LazyPage>
        ),
      },
      {
        path: "addresses",
        element: (
          <LazyPage>
            <Addresses />
          </LazyPage>
        ),
      },
      {
        path: "reviews",
        element: (
          <LazyPage>
            <Reviews />
          </LazyPage>
        ),
      },
      {
        path: "notifications",
        element: (
          <LazyPage>
            <Notifications />
          </LazyPage>
        ),
      },
      {
        path: "support",
        element: (
          <LazyPage>
            <HelpCenter />
          </LazyPage>
        ),
      },
      {
        path: "profile",
        element: (
          <LazyPage>
            <Profile />
          </LazyPage>
        ),
      },
      {
        path: "settings",
        element: (
          <LazyPage>
            <Settings />
          </LazyPage>
        ),
      },
    ],
  },

  // Customer Dashboard Backwards-compatibility alias (/dashboard/* -> /app/*, /customer/* -> /app/*)
  {
    path: "/dashboard",
    element: <Navigate to="/app/bookings" replace />,
  },
  {
    path: "/dashboard/:subpage",
    element: <Navigate to="/app/bookings" replace />,
  },
  {
    path: "/customer",
    element: <Navigate to="/app/bookings" replace />,
  },
  {
    path: "/customer/:subpage",
    element: <Navigate to="/app/bookings" replace />,
  },

  // ─── Professional Platform Routes (/professional/* - Section 45) ───
  {
    path: "/professional",
    errorElement: <RouteErrorBoundary />,
    element: (
      <ProtectedRoute>
        <RoleProtectedRoute allowedRoles={["PROFESSIONAL", "TECHNICIAN", "ADMIN", "SUPER_ADMIN"]}>
          <DashboardLayout
            links={PROFESSIONAL_SIDEBAR_LINKS}
            title="Professional Portal"
          />
        </RoleProtectedRoute>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/professional/jobs" replace />,
      },
      {
        path: "jobs",
        element: (
          <LazyPage>
            <TechJobList />
          </LazyPage>
        ),
      },
      {
        path: "jobs/:id",
        element: (
          <LazyPage>
            <TechJobDetail />
          </LazyPage>
        ),
      },
      {
        path: "calendar",
        element: (
          <LazyPage>
            <TechCalendar />
          </LazyPage>
        ),
      },
      {
        path: "earnings",
        element: (
          <LazyPage>
            <TechEarnings />
          </LazyPage>
        ),
      },
      {
        path: "wallet",
        element: (
          <LazyPage>
            <TechWallet />
          </LazyPage>
        ),
      },
      {
        path: "ratings",
        element: (
          <LazyPage>
            <TechRatings />
          </LazyPage>
        ),
      },
      {
        path: "profile",
        element: (
          <LazyPage>
            <TechProfile />
          </LazyPage>
        ),
      },
      {
        path: "kyc",
        element: (
          <LazyPage>
            <TechKYC />
          </LazyPage>
        ),
      },
      {
        path: "documents",
        element: (
          <LazyPage>
            <TechDocuments />
          </LazyPage>
        ),
      },
      {
        path: "support",
        element: (
          <LazyPage>
            <TechSupport />
          </LazyPage>
        ),
      },
      {
        path: "settings",
        element: (
          <LazyPage>
            <TechSettings />
          </LazyPage>
        ),
      },
      {
        path: "availability",
        element: (
          <LazyPage>
            <TechCalendar />
          </LazyPage>
        ),
      },
      {
        path: "inventory",
        element: (
          <LazyPage>
            <TechInventory />
          </LazyPage>
        ),
      },
      {
        path: "attendance",
        element: (
          <LazyPage>
            <TechAttendance />
          </LazyPage>
        ),
      },
    ],
  },

  // Technician Backwards-compatibility alias (/technician/* -> /professional/*)
  {
    path: "/technician",
    element: <Navigate to="/professional/jobs" replace />,
  },
  {
    path: "/technician/:subpage",
    element: <Navigate to="/professional/jobs" replace />,
  },

  // ─── Admin Platform Routes (/admin/* - Section 46) ───
  {
    path: "/admin",
    errorElement: <RouteErrorBoundary />,
    element: (
      <ProtectedRoute>
        <RoleProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN", "FINANCE_ADMIN", "OPERATIONS_MANAGER", "SUPPORT_AGENT"]}>
          <DashboardLayout links={ADMIN_SIDEBAR_LINKS} title="Admin Center" />
        </RoleProtectedRoute>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <LazyPage>
            <AdminDashboard />
          </LazyPage>
        ),
      },
      {
        path: "dashboard",
        element: (
          <LazyPage>
            <AdminDashboard />
          </LazyPage>
        ),
      },
      {
        path: "admins",
        element: (
          <RoleProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
            <LazyPage>
              <AdminManagement />
            </LazyPage>
          </RoleProtectedRoute>
        ),
      },
      {
        path: "operations",
        element: (
          <LazyPage>
            <AdminLiveOperations />
          </LazyPage>
        ),
      },
      {
        path: "professionals/applications",
        element: (
          <LazyPage>
            <AdminTechnicians />
          </LazyPage>
        ),
      },
      {
        path: "availability",
        element: (
          <LazyPage>
            <AdminTechnicians />
          </LazyPage>
        ),
      },
      {
        path: "wallets",
        element: (
          <LazyPage>
            <AdminPayments />
          </LazyPage>
        ),
      },
      {
        path: "payouts",
        element: (
          <LazyPage>
            <AdminPayments />
          </LazyPage>
        ),
      },
      {
        path: "invoices",
        element: (
          <LazyPage>
            <AdminPayments />
          </LazyPage>
        ),
      },
      {
        path: "service-areas",
        element: (
          <LazyPage>
            <AdminSettingsCMS />
          </LazyPage>
        ),
      },
      {
        path: "analytics",
        element: (
          <LazyPage>
            <AdminAnalytics />
          </LazyPage>
        ),
      },
      {
        path: "bookings",
        element: (
          <LazyPage>
            <AdminBookings />
          </LazyPage>
        ),
      },
      {
        path: "customers",
        element: (
          <LazyPage>
            <AdminCustomers />
          </LazyPage>
        ),
      },
      {
        path: "professionals",
        element: (
          <LazyPage>
            <AdminTechnicians />
          </LazyPage>
        ),
      },
      {
        path: "professionals/:id",
        element: (
          <LazyPage>
            <AdminTechnicians />
          </LazyPage>
        ),
      },
      {
        path: "technicians",
        element: (
          <LazyPage>
            <AdminTechnicians />
          </LazyPage>
        ),
      },
      {
        path: "technicians/:id",
        element: (
          <LazyPage>
            <AdminTechnicians />
          </LazyPage>
        ),
      },
      {
        path: "services",
        element: (
          <LazyPage>
            <AdminServicesCMS />
          </LazyPage>
        ),
      },
      {
        path: "categories",
        element: (
          <LazyPage>
            <AdminCategoriesCMS />
          </LazyPage>
        ),
      },
      {
        path: "pricing",
        element: (
          <LazyPage>
            <AdminPricingCMS />
          </LazyPage>
        ),
      },
      {
        path: "payments",
        element: (
          <LazyPage>
            <AdminPayments />
          </LazyPage>
        ),
      },
      {
        path: "refunds",
        element: (
          <LazyPage>
            <AdminRefundsCMS />
          </LazyPage>
        ),
      },
      {
        path: "membership",
        element: (
          <LazyPage>
            <AdminMembershipCMS />
          </LazyPage>
        ),
      },
      {
        path: "coupons",
        element: (
          <LazyPage>
            <AdminCouponsCMS />
          </LazyPage>
        ),
      },
      {
        path: "reviews",
        element: (
          <LazyPage>
            <AdminReviewsCMS />
          </LazyPage>
        ),
      },
      {
        path: "support",
        element: (
          <LazyPage>
            <AdminSupportCMS />
          </LazyPage>
        ),
      },
      {
        path: "notifications",
        element: (
          <LazyPage>
            <AdminNotificationsCMS />
          </LazyPage>
        ),
      },
      {
        path: "cms",
        element: (
          <LazyPage>
            <AdminContentCMS />
          </LazyPage>
        ),
      },
      {
        path: "reports",
        element: (
          <LazyPage>
            <AdminReports />
          </LazyPage>
        ),
      },
      {
        path: "audit-logs",
        element: (
          <LazyPage>
            <AdminAuditLogsCMS />
          </LazyPage>
        ),
      },
      {
        path: "settings",
        element: (
          <LazyPage>
            <AdminSettingsCMS />
          </LazyPage>
        ),
      },
      {
        path: "system/integrations",
        element: (
          <LazyPage>
            <AdminSystemIntegrations />
          </LazyPage>
        ),
      },
      {
        path: "integrations",
        element: (
          <LazyPage>
            <AdminSystemIntegrations />
          </LazyPage>
        ),
      },
      {
        path: "operations/live",
        element: (
          <LazyPage>
            <AdminLiveOperations />
          </LazyPage>
        ),
      },
      {
        path: "live-operations",
        element: (
          <LazyPage>
            <AdminLiveOperations />
          </LazyPage>
        ),
      },
      {
        path: "system/data-quality",
        element: (
          <LazyPage>
            <AdminDataQualityCMS />
          </LazyPage>
        ),
      },
      {
        path: "data-quality",
        element: (
          <LazyPage>
            <AdminDataQualityCMS />
          </LazyPage>
        ),
      },
    ],
  },
    ],
  },
]);
