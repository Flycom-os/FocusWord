import { ThemeProvider as NextThemesProvider } from "next-themes";

interface ThemeProviderProps {
  attribute?: string;
  defaultTheme?: string;
  enableSystem?: boolean;
  storageKey?: string;
  children: React.ReactNode;
  disableTransitionOnChange?:any;
}

export const ThemeProvider = ({ children, ...props }: ThemeProviderProps) => {
  // @ts-ignore
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
};
