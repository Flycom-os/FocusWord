'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AuthUser, PermissionString } from "@/src/shared/types/auth";
import { loginRequest, LoginPayload, registerRequest, RegisterPayload } from "@/src/shared/api/auth";

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  hasPermission: (resource: string, minLevel: number) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "focusword_auth";

interface StoredAuth {
  user: AuthUser;
  accessToken: string;
}

const parsePermission = (permission: PermissionString) => {
  const [resource, levelStr] = permission.split(":");
  const level = parseInt(levelStr ?? "0", 10);
  return { resource, level: Number.isNaN(level) ? 0 : level };
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setIsLoading(false);
        return;
      }
      const parsed: StoredAuth = JSON.parse(raw);
      setUser(parsed.user);
      setAccessToken(parsed.accessToken);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  const persist = useCallback((nextUser: AuthUser, token: string) => {
    setUser(nextUser);
    setAccessToken(token);
    if (typeof window !== "undefined") {
      const toStore: StoredAuth = { user: nextUser, accessToken: token };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    }
  }, []);

  const clear = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

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
  }, [clear]);

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
    }),
    [user, accessToken, isLoading, login, register, logout, hasPermission],
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


