'use client'
import React, { useState, useEffect, useRef } from 'react';
import styles from './ui-site-header.module.css';
import { ChevronLeft, ChevronDown, Settings, LogOut, User } from 'lucide-react';
import { useAuth } from '@/src/app/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { UiButton } from '@/src/shared/ui';
import Profile from '@/src/pages/profile';

interface HeaderProps {
  onBackClick?: () => void;
  userName?: string;
  onUserMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : "Guest";
  
  // Формируем полный URL для аватара
  const avatarUrl = user?.avatarUrl ? 
    (user.avatarUrl.startsWith('http') ? user.avatarUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1331'}${user.avatarUrl}`) 
    : '';

  const handleSettingsClick = () => {
    router.push("/admin/settings");
    setIsDropdownOpen(false);
  };
  const handleUsersClick = () => {
    router.push("/admin/profile");
    setIsDropdownOpen(false);
  };

  const handleLogoutClick = () => {
    logout();
    router.push("/signin");
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <UiButton
          theme="primary"
          onClick={() => router.back()}
          className={styles.backButton}
        >
          <ChevronLeft size={20} />
          <span>Back</span>
        </UiButton>

        <div className={styles.userSection} onClick={toggleDropdown}>
          <div className={styles.userName}>{userName}</div>
          <button className={styles.dropdownButton}>
            <ChevronDown size={16} />
          </button>
        </div>
      </div>

      {/* Beautiful Dropdown */}
      {isDropdownOpen && (
        <div className={styles.dropdownOverlay} ref={dropdownRef}>
          <div className={styles.dropdown}>
            <div className={styles.dropdownHeader}>
              <div className={styles.userAvatar}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="User Avatar" className={styles.avatarImage} />
                ) : (
                  <User size={20} />
                )}
              </div>
              <div className={styles.userInfo}>
                <div className={styles.dropdownUserName}>{userName}</div>
                <div className={styles.userRole}>{user?.role?.name || 'User'}</div>
              </div>
            </div>
            
            <div className={styles.dropdownDivider}></div>

            <button
              className={styles.dropdownItem}
              onClick={handleUsersClick}
            >
              <User size={16} />
              <span>Profile</span>
            </button>

            <button
              className={styles.dropdownItem}
              onClick={handleSettingsClick}
            >
              <Settings size={16} />
              <span>Settings</span>
            </button>

            <button
              className={styles.dropdownItem}
              onClick={handleLogoutClick}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
