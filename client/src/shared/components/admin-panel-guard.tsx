"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/src/app/providers/auth-provider";
import { getAdminRoutePermission, isAdminAuthOnlyPath } from "@/src/shared/auth/route-permissions";

interface AdminPanelGuardProps {
  children: React.ReactNode;
}

const AdminPanelGuard: React.FC<AdminPanelGuardProps> = ({ children }) => {
  const { hasPermission, user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push("/signin");
      return;
    }

    if (!pathname || isAdminAuthOnlyPath(pathname)) {
      setIsChecking(false);
      return;
    }

    const requiredPermission = getAdminRoutePermission(pathname);

    if (requiredPermission) {
      const hasAccess = hasPermission(requiredPermission.resource, requiredPermission.minLevel);

      if (!hasAccess) {
        router.push("/admin/settings");
        return;
      }
    }

    setIsChecking(false);
  }, [isLoading, user, pathname, router, hasPermission]);

  if (isLoading || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" />
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminPanelGuard;
