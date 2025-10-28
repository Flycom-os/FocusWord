/**
 * @widget Public Header
 */

'use client'
import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, Home, BookOpen, User, Settings } from "lucide-react";
import Button from "@/src/shared/ui/Button/ui-button";
import styles from "./PublicHeader.module.css";

const PublicHeader = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleAdminClick = () => {
    router.push('/admin');
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Логотип */}
        <Link href="/" className={styles.logo}>
          <BookOpen size={24} />
          <span>TypeWord CMS</span>
        </Link>

        {/* Десктопное меню */}
        <nav className={styles.nav}>
          <Link 
            href="/" 
            className={`${styles.navLink} ${isActive('/') ? styles.active : ''}`}
          >
            <Home size={16} />
            Главная
          </Link>
          <Link 
            href="/posts" 
            className={`${styles.navLink} ${isActive('/posts') ? styles.active : ''}`}
          >
            <BookOpen size={16} />
            Блог
          </Link>
        </nav>

        {/* Кнопки действий */}
        <div className={styles.actions}>
          <Button 
            theme="third" 
            onClick={handleAdminClick}
            className={styles.adminButton}
          >
            <Settings size={16} />
            Админ панель
          </Button>
        </div>

        {/* Мобильное меню */}
        <button 
          className={styles.mobileMenuButton}
          onClick={toggleMobileMenu}
          aria-label="Открыть меню"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Мобильное меню */}
      {isMobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <nav className={styles.mobileNav}>
            <Link 
              href="/" 
              className={`${styles.mobileNavLink} ${isActive('/') ? styles.active : ''}`}
              onClick={closeMobileMenu}
            >
              <Home size={16} />
              Главная
            </Link>
            <Link 
              href="/posts" 
              className={`${styles.mobileNavLink} ${isActive('/posts') ? styles.active : ''}`}
              onClick={closeMobileMenu}
            >
              <BookOpen size={16} />
              Блог
            </Link>
          </nav>
          <div className={styles.mobileActions}>
            <Button 
              theme="secondary" 
              onClick={() => {
                handleAdminClick();
                closeMobileMenu();
              }}
              className={styles.mobileAdminButton}
            >
              <Settings size={16} />
              Админ панель
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default PublicHeader;
