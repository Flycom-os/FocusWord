/** Сегменты, зарезервированные под системные маршруты Next.js-приложения. */
export const RESERVED_SITE_SLUGS = new Set([
  "admin",
  "signin",
  "pages",
  "my",
  "api",
  "_next",
  "favicon.ico",
]);

export function isReservedSiteSlug(slug: string): boolean {
  return RESERVED_SITE_SLUGS.has(slug.toLowerCase());
}

/** Публичная страница сайта: один сегмент URL, не зарезервированный. */
export function isPublicSitePagePath(pathname: string): boolean {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length !== 1) {
    return false;
  }
  return !isReservedSiteSlug(segments[0]);
}
