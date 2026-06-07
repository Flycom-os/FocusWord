import type { Metadata } from "next";
import { AuthProvider } from "@/src/app/providers/auth-provider";
import { WidgetRenderer } from "@/src/widgets/widget-renderer/WidgetRenderer";

export const metadata: Metadata = {
  title: "FocusWord",
};

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fallbackHeader = (
    <header className="border-b border-gray-100 py-4 px-6 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          FocusWord
        </span>
      </div>
      <nav className="flex gap-6 items-center">
        <a href="/" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
          Главная
        </a>
        <a href="/blog" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
          Блог
        </a>
        <a
          href="/articles"
          className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
        >
          Статьи
        </a>
        <a
          href="/records"
          className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
        >
          Записи
        </a>
        <a
          href="/admin"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all font-medium text-sm"
        >
          Панель управления
        </a>
      </nav>
    </header>
  );

  const fallbackFooter = (
    <footer className="border-t border-gray-100 py-8 px-6 mt-12 bg-gray-50 text-center text-gray-500 text-sm">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <span className="font-semibold text-gray-700">FocusWord</span> &copy;{" "}
          {new Date().getFullYear()} — Все права защищены.
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-gray-800 transition-colors">
            Политика конфиденциальности
          </a>
          <a href="#" className="hover:text-gray-800 transition-colors">
            Условия использования
          </a>
        </div>
      </div>
    </footer>
  );

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-white text-gray-900">
        <WidgetRenderer slug="header" fallback={fallbackHeader} />
        <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <WidgetRenderer slug="footer" fallback={fallbackFooter} />
      </div>
    </AuthProvider>
  );
}
