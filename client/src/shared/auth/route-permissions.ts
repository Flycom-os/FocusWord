export interface RoutePermission {
  resource: string;
  minLevel: number;
}

/** Маршруты admin без проверки конкретного ресурса (достаточно быть залогиненным). */
export const ADMIN_AUTH_ONLY_PATHS = ["/admin", "/admin/", "/admin/profile", "/admin/settings"];

export const ADMIN_ROUTE_PERMISSIONS: Record<string, RoutePermission> = {
  "/admin/analytics": { resource: "media-files", minLevel: 0 },
  "/admin/products": { resource: "media-files", minLevel: 0 },
  "/admin/product-categories": { resource: "media-files", minLevel: 0 },
  "/admin/feedback": { resource: "media-files", minLevel: 0 },
  "/admin/media-files": { resource: "media-files", minLevel: 0 },
  "/admin/sliders": { resource: "sliders", minLevel: 0 },
  "/admin/records": { resource: "records", minLevel: 0 },
  "/admin/records/categories": { resource: "record-categories", minLevel: 0 },
  "/admin/pages": { resource: "pages", minLevel: 0 },
  "/admin/posts": { resource: "media-files", minLevel: 0 },
  "/admin/users": { resource: "users", minLevel: 0 },
  "/admin/roles": { resource: "roles", minLevel: 0 },
  "/admin/payments": { resource: "media-files", minLevel: 0 },
  "/admin/activity-logs": { resource: "activity-logs", minLevel: 0 },
  "/admin/structured-data": { resource: "media-files", minLevel: 0 },
  "/admin/blocks": { resource: "media-files", minLevel: 0 },
  "/admin/comments": { resource: "media-files", minLevel: 0 },
  "/admin/tags": { resource: "tags", minLevel: 0 },
  "/admin/widgets": { resource: "media-files", minLevel: 0 },
  "/admin/seo": { resource: "media-files", minLevel: 0 },
};

const sortedRouteKeys = Object.keys(ADMIN_ROUTE_PERMISSIONS).sort((a, b) => b.length - a.length);

export function isAdminAuthOnlyPath(pathname: string): boolean {
  const normalized =
    pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  return ADMIN_AUTH_ONLY_PATHS.some(
    (route) => normalized === route || normalized === route.replace(/\/$/, ""),
  );
}

/** Самый длинный совпадающий префикс маршрута. */
export function getAdminRoutePermission(pathname: string): RoutePermission | null {
  if (!pathname.startsWith("/admin")) {
    return null;
  }
  if (isAdminAuthOnlyPath(pathname)) {
    return null;
  }
  if (ADMIN_ROUTE_PERMISSIONS[pathname]) {
    return ADMIN_ROUTE_PERMISSIONS[pathname];
  }
  for (const route of sortedRouteKeys) {
    if (pathname === route || pathname.startsWith(`${route}/`)) {
      return ADMIN_ROUTE_PERMISSIONS[route];
    }
  }
  return null;
}

export function hasResourcePermission(
  permissions: string[] | undefined,
  resource: string,
  minLevel: number,
): boolean {
  if (!permissions?.length) {
    return false;
  }
  return permissions.some((perm) => {
    const [permResource, permLevelStr] = perm.split(":");
    const permLevel = parseInt(permLevelStr || "0", 10);
    return permResource === resource && permLevel >= minLevel;
  });
}

export function getPermissionsFromJwtPayload(
  payload: Record<string, unknown> | null,
): string[] | undefined {
  if (!payload) {
    return undefined;
  }
  const role = payload.role as { permissions?: string[] } | undefined;
  const user = payload.user as { role?: { permissions?: string[] } } | undefined;
  return role?.permissions ?? user?.role?.permissions;
}
