'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/app/providers/auth-provider';

interface WithPermissionsProps {
  resource: string;
  minLevel: number;
  redirectTo?: string;
}

export function withPermissions<P extends object>(
  Component: React.ComponentType<P>,
  options: WithPermissionsProps
) {
  return function PermissionWrapper(props: P) {
    const { hasPermission, user } = useAuth();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
      const checkPermissions = () => {
        console.log('=== HOC PERMISSION CHECK ===');
        console.log('User:', user);
        console.log('User permissions:', user?.role?.permissions);
        console.log('Checking permissions for:', options.resource, options.minLevel);
        
        const hasAccess = hasPermission(options.resource, options.minLevel);
        
        console.log('Permission result:', hasAccess);
        
        if (!hasAccess) {
          console.log('No permissions, redirecting to:', options.redirectTo || '/admin-panel/settings');
          // Пробуем разные способы редиректа
          window.location.href = options.redirectTo || '/admin-panel/settings';
          return;
        }
        
        console.log('Access granted, showing component');
        setIsChecking(false);
      };

      // Добавляем небольшую задержку, чтобы AuthProvider успел загрузиться
      const timer = setTimeout(checkPermissions, 100);
      
      return () => clearTimeout(timer);
    }, [hasPermission, user, router, options]);

    if (isChecking) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Проверка прав доступа...</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}
