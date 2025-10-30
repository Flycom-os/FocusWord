'use client'
import { ThemeProvider } from "@/src/app/providers/theme-provider";
import { ReactNode, useEffect } from "react";
import { QueryProvider } from "@/src/app/providers/query-provider";

const SESSION_EXP_KEY = "session_expire_at";

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

const App = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const exp = localStorage.getItem(SESSION_EXP_KEY);
      if (exp && Date.now() > Number(exp)) {
        deleteCookie("access_token");
        deleteCookie("refresh_token");
        localStorage.removeItem(SESSION_EXP_KEY);
      }
    }
  }, []);

  return (
    <QueryProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        {children}
      </ThemeProvider>
    </QueryProvider>
  );
};
export default App;
