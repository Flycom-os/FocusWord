'use client';

import { ThemeProvider } from "@/src/app/providers/theme-provider";
import { ReactNode } from "react";
import { AuthProvider } from "@/src/app/providers/auth-provider";

const App = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
};
export default App;
