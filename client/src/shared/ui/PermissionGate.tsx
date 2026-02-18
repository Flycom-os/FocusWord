'use client';

import React from "react";
import { useAuth } from "@/src/app/providers/auth-provider";

interface PermissionGateProps {
  resource: string;
  level: number;
  children: React.ReactNode;
}

const PermissionGate = ({ resource, level, children }: PermissionGateProps) => {
  const { hasPermission } = useAuth();

  if (!hasPermission(resource, level)) {
    return null;
  }

  return <>{children}</>;
};

export default PermissionGate;


