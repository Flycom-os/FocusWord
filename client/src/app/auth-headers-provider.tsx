"use client";

import { useEffect } from "react";
import { clearAuthCookie, setAuthCookie } from "@/src/shared/auth/auth-cookie";
import { useAuth } from "./providers/auth-provider";

// Cookie для middleware (нет доступа к localStorage)
export const AuthHeadersProvider = ({ children }: { children: React.ReactNode }) => {
  const { accessToken } = useAuth();

  useEffect(() => {
    if (accessToken) {
      setAuthCookie(accessToken);
    } else {
      clearAuthCookie();
    }
  }, [accessToken]);

  return <>{children}</>;
};
