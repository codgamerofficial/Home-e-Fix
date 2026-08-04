import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router";
import { RootLayout } from "../layouts/RootLayout";
import { AuthLayout } from "../layouts/AuthLayout";
import { ROUTES } from "../constants/routes";
import { PageSkeleton } from "../components/shared/LoadingSkeleton";

/* ─── Lazy-loaded Pages ─── */

const Home = lazy(() => import("../pages/Home"));
const ServiceCatalog = lazy(() => import("../pages/services/ServiceCatalog"));
const CategoryDetail = lazy(() => import("../pages/services/CategoryDetail"));
const NotFound = lazy(() => import("../pages/NotFound"));
const Login = lazy(() => import("../pages/auth/Login"));
const Register = lazy(() => import("../pages/auth/Register"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));

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
    ],
  },
]);
