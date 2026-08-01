import type { Metadata } from "next";
import "@/src/app/styles/index.css";
import App from "@/src/app/app";

export const metadata: Metadata = {
  title: "TypeWord CMS",
  description: "Welcome to TypeWord CMS",
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="en">
      <head />
      <body>
        <App>{children}</App>
      </body>
    </html>
  );
};
export default RootLayout;
