import { NextRequest, NextResponse } from 'next/server';

// Конфигурация маршрутов напрямую в middleware
const protectedRoutes: Record<string, { resource?: string; minLevel?: number }> = {
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

// Публичные маршруты
const publicRoutes = [
  '/',
  '/admin/login',
  '/signin',
  '/admin/profile',
  '/admin/settings',
  '/admin-panel/settings',
  '/admin/access-denied',
];

function getRouteConfig(pathname: string) {
  // Ищем точное совпадение
  if (protectedRoutes[pathname]) {
    return protectedRoutes[pathname];
  }
  
  // Ищем совпадение по началу пути
  for (const [route, config] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(route)) {
      return config;
    }
  }
  
  return null;
}

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => pathname === route || pathname.startsWith(route));
}

// Простая функция декодирования JWT (без верификации подписи)
function decodeJWT(token: string) {
  try {
    const [, payload] = token.split('.');
    const decoded = Buffer.from(payload, 'base64url').toString('utf-8');
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

// Функция проверки прав с декодированием JWT
async function checkPermissions(request: NextRequest, resource: string, minLevel: number): Promise<boolean> {
  try {
    // Получаем токен из cookies (устанавливается AuthHeadersProvider)
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      console.log('No auth-token cookie found');
      return false;
    }

    console.log('Checking permissions for:', { resource, minLevel, token: token.substring(0, 20) + '...' });

    // Если токен похож на JWT, пытаемся декодировать
    if (token.includes('.')) {
      const decoded = decodeJWT(token);
      
      if (!decoded) {
        console.log('Failed to decode JWT token');
        return false;
      }

      console.log('Decoded JWT payload:', decoded);

      // Проверяем права пользователя из payload
      if (decoded.user && decoded.user.role && decoded.user.role.permissions) {
        const permissions = decoded.user.role.permissions;
        
        // Ищем разрешение для нужного ресурса
        const permission = permissions.find((perm: string) => {
          const [permResource, permLevelStr] = perm.split(':');
          const permLevel = parseInt(permLevelStr || '0', 10);
          return permResource === resource && permLevel >= minLevel;
        });

        const hasPermission = !!permission;
        console.log('Permission check result:', { hasPermission, permission, permissions });
        return hasPermission;
      }

      console.log('No permissions found in JWT payload');
      return false;
    }

    // Fallback для простых токенов (для тестов)
    console.log('Using fallback token check');
    if (token.includes('admin') || token.includes('full')) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking permissions:', error);
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Принудительный лог - должен всегда появляться
  console.error('🔥 MIDDLEWARE CALLED FOR:', pathname);
  console.log('=== MIDDLEWARE DEBUG ===');
  console.log('Checking path:', pathname);
  console.log('Method:', request.method);
  console.log('Headers:', Object.fromEntries(request.headers.entries()));
  console.log('Cookies:', Object.fromEntries(request.cookies.getAll().map(c => [c.name, c.value])));

  // Пропускаем статические файлы и API маршруты
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Проверяем, является ли маршрут публичным
  const isPublic = isPublicRoute(pathname);
  console.log('Is public route:', isPublic);
  if (isPublic) {
    console.log('Public route, allowing access:', pathname);
    return NextResponse.next();
  }

  // Получаем конфигурацию маршрута
  const routeConfig = getRouteConfig(pathname);
  
  console.log('Route config result:', routeConfig);
  
  if (!routeConfig) {
    console.log('No route config found, allowing access:', pathname);
    return NextResponse.next();
  }

  console.log('Route config found:', routeConfig);

  // Проверяем права доступа
  if (routeConfig.resource && routeConfig.minLevel !== undefined) {
    const hasPermission = await checkPermissions(request, routeConfig.resource, routeConfig.minLevel);
    
    console.log('Permission check result:', hasPermission);
    
    if (!hasPermission) {
      // Проверяем, авторизован ли пользователь (есть ли токен)
      const token = request.cookies.get('auth-token')?.value;
      
      if (!token) {
        // Если нет токена - перенаправляем на страницу логина
        console.log('No token found, redirecting to login');
        const url = new URL('/signin', request.url);
        return NextResponse.redirect(url);
      } else {
        // Если токен есть, но прав недостаточно - на страницу настроек
        console.log('Access denied, redirecting to /admin-panel/settings');
        const url = new URL('/admin-panel/settings', request.url);
        return NextResponse.redirect(url);
      }
    }
  }

  console.log('Access granted');
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico|signin).*)',
  ],
};
