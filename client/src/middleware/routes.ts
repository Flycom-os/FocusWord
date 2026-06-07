export {
  ADMIN_ROUTE_PERMISSIONS as protectedRoutes,
  ADMIN_AUTH_ONLY_PATHS as publicRoutes,
  getAdminRoutePermission as getRouteConfig,
  isAdminAuthOnlyPath as isPublicRoute,
} from "@/src/shared/auth/route-permissions";

export type { RoutePermission as RouteConfig } from "@/src/shared/auth/route-permissions";
