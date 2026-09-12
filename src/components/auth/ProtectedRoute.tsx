import React from "react";
import { Navigate } from "react-router-dom";

export function ProtectedRouter({children}: {children: React.ReactNode}) {
  const token = localStorage.getItem("access_token")

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>;
}

export function PublicRoute({children}: {children: React.ReactNode}) {
  const token = localStorage.getItem("access_token")

  if (token) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>;
}