'use client'
import React, { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import styles from "./index.module.css";
import Button from "@/src/shared/ui/Button/ui-button";
import logo from "@/src/public/logo.svg"
import logosmall from "@/src/public/small-log.svg"
import Image from "next/image"
import { useRouter } from "next/navigation";

const menuItems = [
  { icon: <Home size={24} />, label: "Home", url: "/admin/" },
  { icon: <ImageIcon size={24} />, label: "Media files", url: "/admin/media-files" },
  { icon: <Archive size={24} />, label: "Records", url: "/admin/records" },
  { icon: <ArchiveRestore size={24} />, label: "Add new record", url: "/admin/records/new" },
  { icon: <Server size={24} />, label: "Category", url: "/admin/records/categories" },
  { icon: <FileText size={24} />, label: "Pages", url: "/admin/pages" },
  { icon: <Users size={24} />, label: "Users", url: "/admin/users" },
  { icon: <Settings size={24} />, label: "Settings", url: "/admin/settings" },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [fullyCollapsed, setFullyCollapsed] = useState(false);
  const asideRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (collapsed) {
      const timeout = setTimeout(() => setFullyCollapsed(true), 800); // 800ms = время transition
      return () => clearTimeout(timeout);
    } else {
      setFullyCollapsed(false);
    }
  }, [collapsed]);

  return (
    <aside
      ref={asideRef}
      className={
        collapsed
          ? styles.sidebarCollapsed + (fullyCollapsed ? ' ' + styles.fullyCollapsed : '')
          : styles.sidebar
      }
    >
      <div className={styles.logo}>
        {collapsed ? (
          <div style={{margin: '0 auto'}}><Image width={40} height={40} alt={'FW'} src={logosmall} /></div>
        ) : (
          <div className={styles.sidebarContent} style={{margin: '0 auto'}}><Image width={200} height={40} alt={'FW'} src={logo} /></div>
        )}
      </div>
      <nav>
        <ul className={styles.menu}>
          {menuItems.map((item) => (
            <li
              key={item.label}
              className={styles.menuItem + ' ' + (collapsed ? styles.menuItemCollapsed : '')}
              onClick={() => item.url && router.push(item.url)}
              style={{ cursor: item.url ? 'pointer' : 'default' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <span className={styles.icon + (fullyCollapsed && collapsed ? ' ' + styles.iconCentered : '')}>{item.icon}</span>
                <span className={styles.sidebarContent}>{item.label}</span>
              </div>
            </li>
          ))}
          <li className={styles.menuItem + ' ' + (collapsed ? styles.menuItemCollapsed : '')} onClick={() => setCollapsed(v => !v)} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <span className={styles.icon + (fullyCollapsed && collapsed ? ' ' + styles.iconCentered : '')}>{collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}</span>
              <span className={styles.sidebarContent}>{collapsed ? "Show" : "Hide"}</span>
            </div>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
