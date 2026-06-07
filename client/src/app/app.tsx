"use client";

import { ThemeProvider } from "@/src/app/providers/theme-provider";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AuthProvider } from "@/src/app/providers/auth-provider";
import { AuthHeadersProvider } from "@/src/app/auth-headers-provider";
import { AdminLayout } from "@/src/app/ui/admin-layout";
import { isPublicSitePagePath } from "@/src/shared/lib/public-routes";

const App = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname() || "";
  const isPublicSite =
    isPublicSitePagePath(pathname) || pathname === "/pages" || pathname.startsWith("/pages/");

  if (isPublicSite) {
    return (
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <AuthProvider>
        <AuthHeadersProvider>
          <AdminLayout>{children}</AdminLayout>
        </AuthHeadersProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
