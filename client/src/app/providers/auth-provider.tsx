"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { AuthUser, PermissionString } from "@/src/shared/types/auth";
import {
  loginRequest,
  LoginPayload,
  registerRequest,
  RegisterPayload,
} from "@/src/shared/api/auth";
import { clearAuthCookie, setAuthCookie } from "@/src/shared/auth/auth-cookie";
import { useRouter } from "next/navigation";

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  hasPermission: (resource: string, minLevel: number) => boolean;
  updateUser?: (user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "focusword_auth";

interface StoredAuth {
  user: AuthUser;
  accessToken: string;
  createdAt: number;
  expiresAt: number;
}

const TOKEN_LIFETIME = 60 * 60 * 1000; // 1 час в миллисекундах

const parsePermission = (permission: PermissionString) => {
  const [resource, levelStr] = permission.split(":");
  const level = parseInt(levelStr ?? "0", 10);
  return { resource, level: Number.isNaN(level) ? 0 : level };
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { setTheme } = useTheme();

  const clear = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
      clearAuthCookie();
    }
  }, []);

  const checkTokenExpiration = useCallback(
    (storedAuth: StoredAuth) => {
      const now = Date.now();
      if (now >= storedAuth.expiresAt) {
        // Токен истек, очищаем
        clear();
        return false;
      }
      return true;
    },
    [clear],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      console.log("Auth: Raw storage data:", raw);

      if (!raw) {
        console.log("Auth: No auth data found, staying on current page");
        setIsLoading(false);
        return;
      }

      const parsed: StoredAuth = JSON.parse(raw);
      console.log("Auth: Parsed data:", parsed);

      // Проверяем наличие полей времени
      if (!parsed.createdAt || !parsed.expiresAt) {
        console.log("Auth: Old format data, clearing");
        // Старый формат данных, очищаем
        clear();
        return;
      }

      // Проверяем время жизни токена
      if (!checkTokenExpiration(parsed)) {
        console.log("Auth: Token expired, clearing and redirecting");
        return;
      }

      console.log("Auth: Setting user and token");
      setUser(parsed.user);
      try {
        setTheme(parsed.user?.themeMode || "light");
      } catch {}
      setAccessToken(parsed.accessToken);
      setAuthCookie(parsed.accessToken);
    } catch (error) {
      console.error("Auth: Error parsing auth data:", error);
      clear();
    } finally {
      setIsLoading(false);
    }
  }, [checkTokenExpiration, clear, router]);

  // Проверяем токен каждую минуту
  useEffect(() => {
    if (!accessToken || typeof window === "undefined") return;

    const interval = setInterval(() => {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          const parsed: StoredAuth = JSON.parse(raw);
          checkTokenExpiration(parsed);
        } catch {
          clear();
        }
      }
    }, 60000); // Проверяем каждую минуту

    return () => clearInterval(interval);
  }, [accessToken, checkTokenExpiration, clear, router]);

  const persist = useCallback((nextUser: AuthUser, token: string) => {
    const now = Date.now();
    const toStore: StoredAuth = {
      user: nextUser,
      accessToken: token,
      createdAt: now,
      expiresAt: now + TOKEN_LIFETIME,
    };

    setUser(nextUser);
    try {
      setTheme(nextUser?.themeMode || "light");
    } catch {}
    setAccessToken(token);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
      setAuthCookie(token);
    }
  }, []);

  const updateUser = useCallback((nextUser: AuthUser) => {
    setUser(nextUser);
    try {
      setTheme(nextUser?.themeMode || "light");
    } catch {}
    if (typeof window !== "undefined") {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          const parsed: StoredAuth = JSON.parse(raw);
          parsed.user = nextUser;
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        } catch (e) {}
      }
    }
  }, [setTheme]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const res = await loginRequest(payload);
      persist(res.user, res.access_token);
    },
    [persist],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const res = await registerRequest(payload);
      persist(res.user, res.access_token);
    },
    [persist],
  );

  const logout = useCallback(() => {
    clear();
    router.push("/signin");
  }, [clear, router]);

  const hasPermission = useCallback(
    (resource: string, minLevel: number) => {
      if (!user || !user.role || !Array.isArray(user.role.permissions)) return false;
      const perms = user.role.permissions.map(parsePermission);
      const perm = perms.find((p) => p.resource === resource);
      if (!perm) return false;
      return perm.level >= minLevel;
    },
    [user],
  );

  const value: AuthContextValue = useMemo(
    () => ({
      user,
      accessToken,
      isLoading,
      login,
      register,
      logout,
      hasPermission,
      updateUser,
    }),
    [user, accessToken, isLoading, login, register, logout, hasPermission, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
