'use client'
import React, { useState } from "react";
import {
  Home,
  FileText,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Archive,
  ArchiveRestore, Server,
  Presentation,
  Shield,
} from "lucide-react";
import styles from "./index.module.css";
import Button from "@/src/shared/ui/Button/ui-button";
import logo from "@/src/public/logo.svg"
import logosmall from "@/src/public/small-log.svg"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/src/app/providers/auth-provider";

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  url: string;
  resource?: string;
  minLevel?: number;
}

const menuItems: MenuItem[] = [
  { icon: <Home size={24} />, label: "Home", url: "/admin/" },
  { icon: <ImageIcon size={24} />, label: "Media files", url: "/admin/media-files", resource: "mediafiles", minLevel: 0 },
  { icon: <Presentation size={24} />, label: "Sliders", url: "/admin/sliders", resource: "sliders", minLevel: 0 },
  { icon: <Archive size={24} />, label: "Records", url: "/admin/records" },
  { icon: <ArchiveRestore size={24} />, label: "Add new record", url: "/admin/records/new" },
  { icon: <Server size={24} />, label: "Category", url: "/admin/records/categories" },
  { icon: <FileText size={24} />, label: "Pages", url: "/admin/pages", resource: "pages", minLevel: 0 },
  { icon: <Users size={24} />, label: "Users", url: "/admin/users", resource: "users", minLevel: 0 },
  { icon: <Shield size={24} />, label: "Roles", url: "/admin/roles", resource: "roles", minLevel: 0 },
  { icon: <Settings size={24} />, label: "Settings", url: "/admin/settings" },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { hasPermission, logout } = useAuth();

  // Фильтрация по правам доступа
  const filteredMenuItems = menuItems.filter((item) => {
    if (item.resource && item.minLevel !== undefined) {
      return hasPermission(item.resource, item.minLevel);
    }
    // Для Settings проверяем наличие хотя бы одного из разрешений
    if (item.label === "Settings") {
      return hasPermission("pages", 0) || hasPermission("sliders", 0) || hasPermission("mediafiles", 0);
    }
    return true;
  });

  // Проверка, является ли путь активным
  const isActive = (url: string) => {
    if (url === "/admin/") {
      return pathname === "/admin" || pathname === "/admin/";
    }
    return pathname.startsWith(url);
  };

  return (
    <aside className={collapsed ? styles.sidebarCollapsed : styles.sidebar}>
      <div className={styles.logo}>
        {collapsed ? <div style={{margin: '0 auto'}}><Image width={40} height={40} alt={'FW'} src={logosmall} /> </div> : <div className={styles.sidebarContent} style={{margin: '0 auto'}}> <Image width={200} height={40} alt={'FW'} src={logo} /></div>}
      </div>
      <nav>
        <ul className={styles.menu}>
          {filteredMenuItems.map((item) => {
            const active = isActive(item.url);
            return (
              <li
                key={item.label}
                className={`${styles.menuItem} ${collapsed ? styles.menuItemCollapsed : ''} ${active ? styles.menuItemActive : ''}`}
                onClick={() => item.url && router.push(item.url)}
                style={{ cursor: item.url ? 'pointer' : 'default' }}
              >
                {collapsed ? (
                  <span className={styles.icon}>{item.icon}</span>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ display: 'flex' }}>
                      <span className={styles.icon}>{item.icon}</span>
                      <span className={collapsed ? styles.sidebarContentCollapsed : styles.sidebarContent}>{item.label}</span>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
          <li
            className={styles.menuItem + ' ' + (collapsed ? styles.menuItemCollapsed : '')}
            onClick={() => logout()}
            style={{ cursor: 'pointer' }}
          >
            <span className={styles.icon}>⎋</span>
            <span className={collapsed ? styles.sidebarContentCollapsed : styles.sidebarContent}>Logout</span>
          </li>
          <li className={styles.menuItem + ' ' + (collapsed ? styles.menuItemCollapsed : '')} onClick={() => setCollapsed(v => !v)} style={{ cursor: 'pointer' }}>
            <span className={styles.icon}>{collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}</span>
            <span className={collapsed ? styles.sidebarContentCollapsed : styles.sidebarContent}>{collapsed ? "Show" : "Hide"}</span>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
