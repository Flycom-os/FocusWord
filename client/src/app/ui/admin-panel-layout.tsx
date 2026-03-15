import SideBar from "@/src/widgets/sidebar/index"
import { ProtectedRoute } from "@/src/app/providers/protected-route";
import styles from "./admin-panel-layout.module.css";
import { Header } from "@/src/app/ui/header";
import React from "react";

const AdminLayout = ({
                       children,
                     }: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <ProtectedRoute>
      <div className={styles.adminLayout}>
        <SideBar />
        <main className={styles.adminContent}>  <Header />{children}</main>
      </div>
    </ProtectedRoute>
  );
};

export default AdminLayout;