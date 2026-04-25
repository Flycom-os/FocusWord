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
  BarChart3,
  Package,
  FolderOpen,
  MessageSquare,
  Layout as LayoutIcon,
  CreditCard,
  Activity,
  Code,
  Box,
  Hash,
  Target,
  Search,
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
  { icon: <BarChart3 size={24} />, label: "Analytics", url: "/admin/analytics" },
  { icon: <Package size={24} />, label: "Products", url: "/admin/products" },
  { icon: <FolderOpen size={24} />, label: "Categories", url: "/admin/product-categories" },
  { icon: <MessageSquare size={24} />, label: "Feedback", url: "/admin/feedback" },
  { icon: <LayoutIcon size={24} />, label: "Page Builder", url: "/admin/page-builder" },
  { icon: <LayoutIcon size={24} />, label: "Page Constructor", url: "/page-constructor" },
  { icon: <ImageIcon size={24} />, label: "Media files", url: "/admin/media-files", resource: "mediafiles", minLevel: 0 },
  { icon: <Presentation size={24} />, label: "Sliders", url: "/admin/sliders", resource: "sliders", minLevel: 0 },
  { icon: <Archive size={24} />, label: "Records", url: "/admin/records" },
  { icon: <ArchiveRestore size={24} />, label: "Add new record", url: "/admin/records/new" },
  { icon: <Server size={24} />, label: "Category", url: "/admin/records/categories" },
  { icon: <FileText size={24} />, label: "Pages", url: "/admin/pages", resource: "pages", minLevel: 0 },
  { icon: <FileText size={24} />, label: "Posts", url: "/admin/posts" },
  { icon: <Users size={24} />, label: "Users", url: "/admin/users", resource: "users", minLevel: 0 },
  { icon: <Shield size={24} />, label: "Roles", url: "/admin/roles", resource: "roles", minLevel: 0 },
  { icon: <Settings size={24} />, label: "Settings", url: "/admin/settings" },
  { icon: <CreditCard size={24} />, label: "Payments", url: "/admin/payments" },
  { icon: <Activity size={24} />, label: "Activity Logs", url: "/admin/activity-logs" },
  { icon: <Code size={24} />, label: "Structured Data", url: "/admin/structured-data" },
  { icon: <Box size={24} />, label: "Blocks", url: "/admin/blocks" },
  { icon: <MessageSquare size={24} />, label: "Comments", url: "/admin/comments" },
  { icon: <Hash size={24} />, label: "Tags", url: "/admin/tags" },
  { icon: <Target size={24} />, label: "Widgets", url: "/admin/widgets" },
  { icon: <Search size={24} />, label: "SEO", url: "/admin/seo" },
  { icon: <FileText size={24} />, label: "Wiki", url: "/admin/wiki" },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
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
    if (!pathname) return false;
    if (url === "/admin/") {
      return pathname === "/admin" || pathname === "/admin/";
    }
    return pathname.startsWith(url);
  };

  return (
    <aside className={collapsed ? styles.sidebarCollapsed : styles.sidebar}>
      <div className={styles.logoContainer}>
        <div className={styles.logo}>
          {collapsed ? <Image width={40} height={40} alt={'FW'} src={logosmall} /> : <Image width={200} height={40} alt={'FW'} src={logo} />}
        </div>
      </div>
      <nav className={styles.navContainer}>
        <ul className={styles.menu}>
          {filteredMenuItems.map((item) => {
            const active = isActive(item.url);
            return (
              <li
                key={item.label}
                className={`${styles.menuItem} ${collapsed ? styles.menuItemCollapsed : ''} ${active ? styles.menuItemActive : ''}`}
                onClick={() => item.url && router.push(item.url)}
                style={{ cursor: item.url ? 'pointer' : 'default' }}
                onMouseEnter={() => collapsed && setHoveredItem(item.label)}
                onMouseLeave={() => collapsed && setHoveredItem(null)}
              >
                {collapsed ? (
                  <div className={styles.iconContainer}>
                    <span className={styles.icon}>{item.icon}</span>
                    {hoveredItem === item.label && (
                      <div key={`popover-${item.label}`} className={styles.popover}>
                        {item.label}
                      </div>
                    )}
                  </div>
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
