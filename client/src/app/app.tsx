'use client';

import { ThemeProvider } from "@/src/app/providers/theme-provider";
import { ReactNode } from "react";
import { AuthProvider } from "@/src/app/providers/auth-provider";
import { AuthHeadersProvider } from "@/src/app/auth-headers-provider";
import { AdminLayout } from "@/src/app/ui/admin-layout";

const App = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
      <AuthProvider>
        <AuthHeadersProvider>
          <AdminLayout>{children}</AdminLayout>
        </AuthHeadersProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};
export default App;
