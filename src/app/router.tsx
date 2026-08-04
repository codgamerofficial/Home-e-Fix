import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router";
import { RootLayout } from "../layouts/RootLayout";
import { AuthLayout } from "../layouts/AuthLayout";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { ROUTES } from "../constants/routes";
import { CUSTOMER_SIDEBAR_LINKS } from "../constants/navigation";
import { PageSkeleton } from "../components/shared/LoadingSkeleton";

/* ─── Lazy-loaded Pages ─── */

const Home = lazy(() => import("../pages/Home"));
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
]);
