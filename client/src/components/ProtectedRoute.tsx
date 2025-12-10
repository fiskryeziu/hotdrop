import React from "react";
import { Navigate } from "react-router-dom";
import { useSession } from "../lib/auth-client";
import { LoadingSpinner } from "./LoadingSpinner";

export const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  roles?: string[];
  excludeRoles?: string[];
}> = ({ children, roles, excludeRoles }) => {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (
    roles &&
    typeof session.user.role === "string" &&
    !roles.includes(session.user.role)
  ) {
    return <Navigate to="/" replace />;
  }

  if (
    excludeRoles &&
    typeof session.user.role === "string" &&
    excludeRoles.includes(session.user.role)
  ) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
