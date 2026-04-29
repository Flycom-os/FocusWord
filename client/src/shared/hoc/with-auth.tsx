'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/app/providers/auth-provider';

interface WithAuthProps {
  resource?: string;
  minLevel?: number;
  requireAny?: boolean;
  redirectTo?: string;
}

const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  options: WithAuthProps = {}
) => {
  const {
    resource,
    minLevel = 0,
    requireAny = false,
    redirectTo = '/admin/settings'
  } = options;

  return function WithAuthComponent(props: P) {
    const { hasPermission, user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (isLoading) return;

      if (!user) {
        router.push('/signin');
        return;
      }

      if (resource) {
        const hasAccess = hasPermission(resource, minLevel);
        
        if (!hasAccess) {
          router.push(redirectTo);
        }
      }
    }, [isLoading, user, router]);

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      );
    }

    if (!user) {
      return null;
    }

    if (resource && !hasPermission(resource, minLevel)) {
      return null;
    }

    return <Component {...props} />;
  };
};

export default withAuth;
