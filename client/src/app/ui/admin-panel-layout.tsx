import SideBar from "@/src/widgets/sidebar/index"

const AdminLayout = ({
                       children,
                     }: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="admin-layout" style={{display:'flex'}}>
      <SideBar/>
      <main className="admin-content">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;