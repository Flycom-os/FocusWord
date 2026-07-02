"use client";

import React, { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/src/app/providers/auth-provider";

import { isPublicSitePagePath } from "@/src/shared/lib/public-routes";

interface ProtectedRouteProps {
  children: ReactNode;
}

const PUBLIC_ROUTES = ["/signin", "/pages"];

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const path = pathname || "";

  useEffect(() => {
    if (isLoading) return;
    const isPublic =
      PUBLIC_ROUTES.includes(path) || path.startsWith("/pages/") || isPublicSitePagePath(path);
    if (!user && !isPublic) {
      router.replace("/signin");
    }
  }, [user, isLoading, path, router]);

  const isPublicRoute =
    PUBLIC_ROUTES.includes(path) || path.startsWith("/pages/") || isPublicSitePagePath(path);

  if (!user && !isPublicRoute) {
    return null;
  }

  return <>{children}</>;
};
