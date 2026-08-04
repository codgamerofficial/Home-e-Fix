import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router";
import { RootLayout } from "../layouts/RootLayout";
import { AuthLayout } from "../layouts/AuthLayout";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { ROUTES } from "../constants/routes";
import { CUSTOMER_SIDEBAR_LINKS, TECHNICIAN_SIDEBAR_LINKS, ADMIN_SIDEBAR_LINKS } from "../constants/navigation";
import { PageSkeleton } from "../components/shared/LoadingSkeleton";

/* ─── Lazy-loaded Pages ─── */

const Home = lazy(() => import("../pages/Home"));
const About = lazy(() => import("../pages/static/About"));
const Contact = lazy(() => import("../pages/static/Contact"));
const Terms = lazy(() => import("../pages/static/Terms"));
const Privacy = lazy(() => import("../pages/static/Privacy"));
const ServiceCatalog = lazy(() => import("../pages/services/ServiceCatalog"));
const CategoryDetail = lazy(() => import("../pages/services/CategoryDetail"));
const BookingWizard = lazy(() => import("../pages/booking/BookingWizard"));
const BookingConfirmed = lazy(() => import("../pages/booking/BookingConfirmed"));
const NotFound = lazy(() => import("../pages/NotFound"));
const Login = lazy(() => import("../pages/auth/Login"));
const Register = lazy(() => import("../pages/auth/Register"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));
const OtpVerification = lazy(() => import("../pages/auth/OtpVerification"));
const ProfileSetup = lazy(() => import("../pages/auth/ProfileSetup"));

/* ─── Customer Dashboard Pages ─── */
const Orders = lazy(() => import("../pages/dashboard/customer/Orders"));
const Wallet = lazy(() => import("../pages/dashboard/customer/Wallet"));
const Membership = lazy(() => import("../pages/dashboard/customer/Membership"));
const Coupons = lazy(() => import("../pages/dashboard/customer/Coupons"));
const Addresses = lazy(() => import("../pages/dashboard/customer/Addresses"));
const Reviews = lazy(() => import("../pages/dashboard/customer/Reviews"));
const Notifications = lazy(() => import("../pages/dashboard/customer/Notifications"));
const Profile = lazy(() => import("../pages/dashboard/customer/Profile"));
const Settings = lazy(() => import("../pages/dashboard/customer/Settings"));
const HelpCenter = lazy(() => import("../pages/dashboard/customer/HelpCenter"));

/* ─── Technician App Pages ─── */
const TechJobList = lazy(() => import("../pages/dashboard/technician/JobList"));
const TechEarnings = lazy(() => import("../pages/dashboard/technician/Earnings"));
const TechWallet = lazy(() => import("../pages/dashboard/technician/Wallet"));
const TechRatings = lazy(() => import("../pages/dashboard/technician/Ratings"));
const TechAvailability = lazy(() => import("../pages/dashboard/technician/Availability"));
const TechInventory = lazy(() => import("../pages/dashboard/technician/Inventory"));
const TechAttendance = lazy(() => import("../pages/dashboard/technician/Attendance"));

/* ─── Admin Dashboard Pages ─── */
const AdminAnalytics = lazy(() => import("../pages/dashboard/admin/Analytics"));
const AdminCustomers = lazy(() => import("../pages/dashboard/admin/Customers"));
const AdminTechnicians = lazy(() => import("../pages/dashboard/admin/Technicians"));
const AdminBookings = lazy(() => import("../pages/dashboard/admin/Bookings"));
const AdminPayments = lazy(() => import("../pages/dashboard/admin/Payments"));
const AdminCouponsCMS = lazy(() => import("../pages/dashboard/admin/CouponsCMS"));
const AdminMembershipCMS = lazy(() => import("../pages/dashboard/admin/MembershipCMS"));
const AdminServicesCMS = lazy(() => import("../pages/dashboard/admin/ServicesCMS"));
const AdminReports = lazy(() => import("../pages/dashboard/admin/Reports"));

/* ─── Suspense Wrapper ─── */

function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageSkeleton />}>{children}</Suspense>;
}

/* ─── Router Configuration ─── */

export const router = createBrowserRouter([
  {
    // Public routes with RootLayout
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
        path: ROUTES.ABOUT,
        element: (
          <LazyPage>
            <About />
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
        path: ROUTES.TERMS,
        element: (
          <LazyPage>
            <Terms />
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
        path: ROUTES.SERVICES,
        element: (
          <LazyPage>
            <ServiceCatalog />
          </LazyPage>
        ),
      },
      {
        path: `${ROUTES.SERVICES}/:categorySlug`,
        element: (
          <LazyPage>
            <CategoryDetail />
          </LazyPage>
        ),
      },
      {
        path: ROUTES.BOOKING,
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
        path: ROUTES.NOT_FOUND,
        element: (
          <LazyPage>
            <NotFound />
          </LazyPage>
        ),
      },
    ],
  },
  {
    // Auth routes with AuthLayout
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: (
          <LazyPage>
            <Login />
          </LazyPage>
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
    ],
  },
  {
    // Customer Dashboard routes with DashboardLayout
    path: "/dashboard",
    element: <DashboardLayout links={CUSTOMER_SIDEBAR_LINKS} title="Customer Account" />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard/orders" replace />,
      },
      {
        path: "orders",
        element: (
          <LazyPage>
            <Orders />
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
        path: "membership",
        element: (
          <LazyPage>
            <Membership />
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
      {
        path: "help",
        element: (
          <LazyPage>
            <HelpCenter />
          </LazyPage>
        ),
      },
    ],
  },
  {
    // Technician App routes with DashboardLayout
    path: "/technician",
    element: <DashboardLayout links={TECHNICIAN_SIDEBAR_LINKS} title="Technician Portal" />,
    children: [
      {
        index: true,
        element: <Navigate to="/technician/jobs" replace />,
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
        path: "availability",
        element: (
          <LazyPage>
            <TechAvailability />
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
  {
    // Admin Dashboard routes with DashboardLayout
    path: "/admin",
    element: <DashboardLayout links={ADMIN_SIDEBAR_LINKS} title="Admin Center" />,
    children: [
      {
        index: true,
        element: <Navigate to="/admin/analytics" replace />,
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
        path: "customers",
        element: (
          <LazyPage>
            <AdminCustomers />
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
        path: "bookings",
        element: (
          <LazyPage>
            <AdminBookings />
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
        path: "coupons",
        element: (
          <LazyPage>
            <AdminCouponsCMS />
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
        path: "services",
        element: (
          <LazyPage>
            <AdminServicesCMS />
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
    ],
  },
]);
