import React from "react";
import { Navigate, useLocation } from "react-router";
import { useAuthStore } from "@/store/auth.store";
import { ROUTES } from "@/constants/routes";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

/**
 * Ensures user is authenticated before accessing private platform routes.
 * Redirects to /auth/login preserving original intended destination URL.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`${ROUTES.LOGIN}?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <>{children}</>;
};

/**
 * Enforces server/database role authorization.
 * Renders an explicit 403 Forbidden surface if an authenticated user attempts to access unauthorized surfaces.
 */
export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={`${ROUTES.LOGIN}?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  const userRoleNormalized = (user.role || "").toUpperCase();
  const normalizedAllowed = allowedRoles.map((r) => r.toUpperCase());

  // Also support technician/professional equivalence
  const hasMatchingRole =
    normalizedAllowed.includes(userRoleNormalized) ||
    (userRoleNormalized === "TECHNICIAN" && normalizedAllowed.includes("PROFESSIONAL")) ||
    (userRoleNormalized === "PROFESSIONAL" && normalizedAllowed.includes("TECHNICIAN"));

  if (!hasMatchingRole) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl space-y-5">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-950/60 text-red-600 rounded-2xl mx-auto flex items-center justify-center">
            <ShieldAlert className="w-9 h-9" />
          </div>

          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            Access Restricted (403)
          </h2>

          <p className="text-sm text-gray-600 dark:text-gray-300">
            Your account ({user.email || user.phone}) is registered as{" "}
            <span className="font-semibold text-primary dark:text-orange-400 capitalize">{user.role}</span>.
            You do not possess the required permissions to access this administrative portal.
          </p>

          <div className="pt-2">
            <Button
              className="w-full bg-primary hover:bg-primary-light"
              onClick={() => {
                if (userRoleNormalized.includes("ADMIN")) {
                  window.location.href = ROUTES.ADMIN;
                } else if (userRoleNormalized.includes("TECH") || userRoleNormalized.includes("PROF")) {
                  window.location.href = ROUTES.PROFESSIONAL;
                } else {
                  window.location.href = ROUTES.APP;
                }
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to Authorized Portal
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

/**
 * Prevents already authenticated users from seeing public login/register pages.
 */
export const PublicOnlyRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    const roleUpper = (user.role || "").toUpperCase();
    if (roleUpper.includes("ADMIN")) {
      return <Navigate to={ROUTES.ADMIN} replace />;
    }
    if (roleUpper.includes("TECH") || roleUpper.includes("PROF")) {
      return <Navigate to={ROUTES.PROFESSIONAL} replace />;
    }
    return <Navigate to={ROUTES.APP} replace />;
  }

  return <>{children}</>;
};
