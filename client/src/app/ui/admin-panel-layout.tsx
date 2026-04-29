import SideBar from "@/src/widgets/sidebar/index"
import { ProtectedRoute } from "@/src/app/providers/protected-route";
import styles from "./admin-panel-layout.module.css";
import { Header } from "@/src/app/ui/header";
import React from "react";
import AdminPanelGuard from "@/src/shared/components/admin-panel-guard";

const AdminLayout = ({
                       children,
                     }: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <ProtectedRoute>
      <AdminPanelGuard>
        <div className={styles.adminLayout}>
          <SideBar />
          <main className={styles.adminContent}>  <Header />{children}</main>
        </div>
      </AdminPanelGuard>
    </ProtectedRoute>
  );
};

export default AdminLayout;