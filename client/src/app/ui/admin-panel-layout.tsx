import SideBar from "@/src/widgets/sidebar/index"
import { ProtectedRoute } from "@/src/app/providers/protected-route";
import styles from "./admin-panel-layout.module.css";

const AdminLayout = ({
                       children,
                     }: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <ProtectedRoute>
      <div className={styles.adminLayout}>
        <SideBar />
        <main className={styles.adminContent}>{children}</main>
      </div>
    </ProtectedRoute>
  );
};

export default AdminLayout;