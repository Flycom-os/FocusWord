'use client'
import SideBar from "@/src/widgets/sidebar/index"
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/src/widgets/header";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  useEffect(() => {
    const token = getCookie("access_token");
    if (!token) {
      router.replace("/signin");
    }
  }, [router]);
  return <>{children}</>;
}

const AdminLayout = ({
                       children,
                     }: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <AuthGuard>
      <div className="admin-layout" style={{display:'flex'}}>
        <SideBar/>

        <main className="admin-content">
          <Header/>
          {children}
        </main>
      </div>
    </AuthGuard>

  );
};

export default AdminLayout;