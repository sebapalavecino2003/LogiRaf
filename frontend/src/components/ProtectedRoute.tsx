import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  children: ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles && user) {
    const userRole = user.rol?.nombre_rol?.toUpperCase() || "";
    const hasAccess = allowedRoles.some((r) => userRole.includes(r.toUpperCase()));
    if (!hasAccess && !userRole.includes("ADMIN")) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}
