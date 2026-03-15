'use client';

import { ThemeProvider } from "@/src/app/providers/theme-provider";
import { ReactNode } from "react";
import { AuthProvider } from "@/src/app/providers/auth-provider";
import { AdminLayout } from "@/src/app/ui/admin-layout";

const App = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
      <AuthProvider>
        <AdminLayout>{children}</AdminLayout>
      </AuthProvider>
    </ThemeProvider>
  );
};
export default App;
