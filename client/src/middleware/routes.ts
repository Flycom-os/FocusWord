import { NextRequest } from 'next/server';

export interface RouteConfig {
  resource?: string;
  minLevel?: number;
}

export const protectedRoutes: Record<string, RouteConfig> = {
  '/admin/analytics': { resource: 'media-files', minLevel: 0 },
  '/admin/products': { resource: 'media-files', minLevel: 0 },
  '/admin/product-categories': { resource: 'media-files', minLevel: 0 },
  '/admin/feedback': { resource: 'media-files', minLevel: 0 },
  '/admin/media-files': { resource: 'media-files', minLevel: 0 },
  '/admin/sliders': { resource: 'sliders', minLevel: 0 },
  '/admin/records': { resource: 'records', minLevel: 0 },
  '/admin/records/categories': { resource: 'record-categories', minLevel: 0 },
  '/admin/pages': { resource: 'pages', minLevel: 0 },
  '/admin/posts': { resource: 'media-files', minLevel: 0 },
  '/admin/users': { resource: 'users', minLevel: 0 },
  '/admin/roles': { resource: 'roles', minLevel: 0 },
  '/admin/payments': { resource: 'media-files', minLevel: 0 },
  '/admin/activity-logs': { resource: 'media-files', minLevel: 0 },
  '/admin/structured-data': { resource: 'media-files', minLevel: 0 },
  '/admin/blocks': { resource: 'media-files', minLevel: 0 },
  '/admin/comments': { resource: 'media-files', minLevel: 0 },
  '/admin/tags': { resource: 'media-files', minLevel: 0 },
  '/admin/widgets': { resource: 'media-files', minLevel: 0 },
  '/admin/seo': { resource: 'media-files', minLevel: 0 },
};

// Публичные маршруты (не требуют проверки прав)
export const publicRoutes = [
  '/',
  '/admin/login',
  '/admin/profile',
  '/admin/settings',
  '/admin/access-denied',
];

export function getRouteConfig(pathname: string): RouteConfig | null {
  // Ищем точное совпадение
  if (protectedRoutes[pathname]) {
    return protectedRoutes[pathname];
  }
  
  // Ищем совпадение по началу пути (для динамических маршрутов)
  for (const [route, config] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(route)) {
      return config;
    }
  }
  
  return null;
}

export function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => pathname === route || pathname.startsWith(route));
}
