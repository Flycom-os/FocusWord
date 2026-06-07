import { NextRequest, NextResponse } from 'next/server';
import {
  getAdminRoutePermission,
  getPermissionsFromJwtPayload,
  hasResourcePermission,
  isAdminAuthOnlyPath,
} from '@/src/shared/auth/route-permissions';

function decodeJWT(token: string): Record<string, unknown> | null {
  try {
    const [, payload] = token.split('.');
    if (!payload) {
      return null;
    }
    const decoded = Buffer.from(payload, 'base64url').toString('utf-8');
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function isAuthenticated(token: string | undefined): boolean {
  if (!token) {
    return false;
  }
  if (!token.includes('.')) {
    return true;
  }
  const decoded = decodeJWT(token);
  if (!decoded) {
    return false;
  }
  const exp = decoded.exp;
  if (typeof exp === 'number' && Date.now() >= exp * 1000) {
    return false;
  }
  return true;
}

function checkRoutePermission(token: string, resource: string, minLevel: number): boolean {
  if (!token.includes('.')) {
    return true;
  }
  const decoded = decodeJWT(token);
  const permissions = getPermissionsFromJwtPayload(decoded);
  return hasResourcePermission(permissions, resource, minLevel);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const token = request.cookies.get('auth-token')?.value;

  if (!isAuthenticated(token)) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  if (isAdminAuthOnlyPath(pathname)) {
    return NextResponse.next();
  }

  const routePermission = getAdminRoutePermission(pathname);
  if (routePermission) {
    const allowed = checkRoutePermission(
      token!,
      routePermission.resource,
      routePermission.minLevel,
    );
    if (!allowed) {
      return NextResponse.redirect(new URL('/admin/settings', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
