'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/src/app/providers/auth-provider';

interface AdminPanelGuardProps {
  children: React.ReactNode;
}

const AdminPanelGuard: React.FC<AdminPanelGuardProps> = ({ children }) => {
  const { hasPermission, user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  // Маппинг путей к необходимым правам доступа (из sidebar)
  const pathPermissions: Record<string, { resource: string; minLevel: number }> = {
    '/admin/analytics': { resource: 'media-filess', minLevel: 0 },
    '/admin/products': { resource: 'media-filess', minLevel: 0 },
    '/admin/product-categories': { resource: 'media-filess', minLevel: 0 },
    '/admin/feedback': { resource: 'media-filess', minLevel: 0 },
    '/admin/media-files': { resource: 'media-files', minLevel: 0 },
    '/admin/sliders': { resource: 'sliders', minLevel: 0 },
    '/admin/records': { resource: 'records', minLevel: 0 },
    '/admin/records/categories': { resource: 'record-categories', minLevel: 0 },
    '/admin/pages': { resource: 'pages', minLevel: 0 },
    '/admin/posts': { resource: 'media-filess', minLevel: 0 },
    '/admin/users': { resource: 'users', minLevel: 0 },
    '/admin/roles': { resource: 'roles', minLevel: 0 },
    '/admin/payments': { resource: 'media-filess', minLevel: 0 },
    '/admin/activity-logs': { resource: 'media-filess', minLevel: 0 },
    '/admin/structured-data': { resource: 'media-filess', minLevel: 0 },
    '/admin/blocks': { resource: 'media-filess', minLevel: 0 },
    '/admin/comments': { resource: 'media-filess', minLevel: 0 },
    '/admin/tags': { resource: 'media-filess', minLevel: 0 },
    '/admin/widgets': { resource: 'media-filess', minLevel: 0 },
    '/admin/seo': { resource: 'media-filess', minLevel: 0 },
  };

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push('/signin');
      return;
    }

    // Проверяем права доступа для текущего пути
    const requiredPermission = pathname ? pathPermissions[pathname] : undefined;
    
    if (requiredPermission) {
      const hasAccess = hasPermission(requiredPermission.resource, requiredPermission.minLevel);
      
      if (!hasAccess) {
        router.push('/admin/settings');
        return;
      }
    }

    // Для страницы settings проверяем наличие хотя бы одного из разрешений
    if (pathname === '/admin/settings') {
      const hasAnyAccess = 
        hasPermission('pages', 0) || 
        hasPermission('sliders', 0) || 
        hasPermission('media-files', 0);
      
      if (!hasAnyAccess) {
        // Если нет никаких прав, оставляем на settings (это страница по умолчанию)
        setIsChecking(false);
        return;
      }
    }

    setIsChecking(false);
  }, [isLoading, user, pathname, router, hasPermission]);

  if (isLoading || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminPanelGuard;
