import SideBar from "@/src/widgets/sidebar/index"
import { ProtectedRoute } from "@/src/app/providers/protected-route";

const AdminLayout = ({
                       children,
                     }: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <ProtectedRoute>
      <div className="admin-layout" style={{ display: "flex" }}>
        <SideBar />
        <main className="admin-content">{children}</main>
      </div>
    </ProtectedRoute>
  );
};

export default AdminLayout;