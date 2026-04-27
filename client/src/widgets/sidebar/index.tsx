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
  PenTool, User,
} from 'lucide-react';
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
  { icon: <ImageIcon size={24} />, label: "Media files", url: "/admin/media-files", resource: "mediafiles", minLevel: 0 },
  { icon: <Presentation size={24} />, label: "Sliders", url: "/admin/sliders", resource: "sliders", minLevel: 0 },
  { icon: <Archive size={24} />, label: "Records", url: "/admin/records" },
  { icon: <Server size={24} />, label: "Category", url: "/admin/records/categories" },
  { icon: <FileText size={24} />, label: "Pages", url: "/admin/pages", resource: "pages", minLevel: 0 },
  { icon: <PenTool size={24} />, label: "Posts", url: "/admin/posts" },
  { icon: <Users size={24} />, label: "Users", url: "/admin/users", resource: "users", minLevel: 0 },
  { icon: <Shield size={24} />, label: "Roles", url: "/admin/roles", resource: "roles", minLevel: 0 },
  { icon: <User size={24} />, label: "Profile", url: "/admin/profile"},
  { icon: <Settings size={24} />, label: "Settings", url: "/admin/settings" },
  { icon: <CreditCard size={24} />, label: "Payments", url: "/admin/payments" },
  { icon: <Activity size={24} />, label: "Activity Logs", url: "/admin/activity-logs" },
  { icon: <Code size={24} />, label: "Structured Data", url: "/admin/structured-data" },
  { icon: <Box size={24} />, label: "Blocks", url: "/admin/blocks" },
  { icon: <MessageSquare size={24} />, label: "Comments", url: "/admin/comments" },
  { icon: <Hash size={24} />, label: "Tags", url: "/admin/tags" },
  { icon: <Target size={24} />, label: "Widgets", url: "/admin/widgets" },
  { icon: <Search size={24} />, label: "SEO", url: "/admin/seo" },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [hoveredLogout, setHoveredLogout] = useState(false);
  const [hoveredToggle, setHoveredToggle] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState<{ top: number; left: number } | null>(null);
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

  // Функция для вычисления позиции поповера
  const calculatePopoverPosition = (event: React.MouseEvent) => {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    
    // Позиция справа от иконки с небольшим отступом
    const left = rect.right + 8;
    const top = rect.top + rect.height / 2;
    
    setPopoverPosition({ left, top });
  };

  // Функция для очистки позиции поповера
  const clearPopoverPosition = () => {
    setPopoverPosition(null);
  };

  return (
    <>
      <aside 
        className={collapsed ? styles.sidebarCollapsed : styles.sidebar}
        onMouseLeave={() => {
          if (collapsed) {
            setHoveredItem(null);
            setHoveredLogout(false);
            setHoveredToggle(false);
            setPopoverPosition(null);
          }
        }}
      >
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
                  onMouseEnter={(e) => collapsed && (setHoveredItem(item.label), calculatePopoverPosition(e))}
                  onMouseLeave={() => collapsed && setHoveredItem(null)}
                >
                  {collapsed ? (
                    <div className={styles.iconContainer}>
                      <span className={styles.icon}>{item.icon}</span>
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
          </ul>
        </nav>
        <li 
          className={styles.menuItem + ' ' + (collapsed ? styles.menuItemCollapsed : '')} 
          onClick={() => setCollapsed(v => !v)} 
          style={{ cursor: 'pointer' }}
          onMouseEnter={(e) => collapsed && (setHoveredToggle(true), calculatePopoverPosition(e))}
          onMouseLeave={() => collapsed && setHoveredToggle(false)}
        >
          {collapsed ? (
            <div className={styles.iconContainer}>
              <span className={styles.icon}><ChevronRight size={20} /></span>
            </div>
          ) : (
            <>
              <span className={styles.icon}><ChevronLeft size={20} /></span>
              <span className={styles.sidebarContent}>Hide</span>
            </>
          )}
        </li>
      </aside>
      
      {/* Global popover rendering */}
      {collapsed && popoverPosition && (
        <div
          className={`${styles.popover} ${styles.popoverVisible}`}
          style={{
            left: `${popoverPosition.left}px`,
            top: `${popoverPosition.top}px`,
            transform: 'translateY(-50%)'
          }}
        >
          {hoveredItem && hoveredItem}
          {hoveredLogout && 'Logout'}
          {hoveredToggle && 'Expand Sidebar'}
        </div>
      )}
    </>
  );
};

export default Sidebar;
