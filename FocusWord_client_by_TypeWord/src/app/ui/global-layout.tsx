import type { Metadata } from "next";
import "@/src/app/styles/index.css";
import App from "@/src/app/app";

export const metadata: Metadata = {
  title: "TypeWord CMS",
  description: "Добро пожаловать в TypeWord CMS",
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="ru">
      <head>
      </head>
      <body>

        <App>{children}</App>
      </body>
    </html>
  );
};
export default RootLayout;
