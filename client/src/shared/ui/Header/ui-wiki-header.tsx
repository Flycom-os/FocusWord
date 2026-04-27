import React, { useState, useRef, useEffect } from 'react';
import styles from './ui-wiki-header.module.css';
import { ChevronLeft, Book, Search, Menu, User, Settings, LogOut, Home, FileText, HelpCircle } from 'lucide-react';
import { useAuth } from '@/src/app/providers/auth-provider';
import { useRouter } from 'next/router';

interface WikiHeaderProps {
  onBackClick?: () => void;
  title?: string;
  showSearch?: boolean;
  onSearchChange?: (query: string) => void;
}

const WikiHeader: React.FC<WikiHeaderProps> = ({
  onBackClick,
  title = 'Knowledge Base',
  showSearch = true,
  onSearchChange,
}) => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : "Guest";
  
  // Формируем полный URL для аватара
  const avatarUrl = user?.avatarUrl ? 
    (user.avatarUrl.startsWith('http') ? user.avatarUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1331'}${user.avatarUrl}`) 
    : '';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (onSearchChange) {
      onSearchChange(query);
    }
  };

  const handleHomeClick = () => {
    router.push('/wiki');
    setIsMobileMenuOpen(false);
  };

  const handleBackClick = () => {
    router.back();
  };

  const handleArticlesClick = () => {
    router.push('/wiki/articles');
    setIsMobileMenuOpen(false);
  };

  const handleHelpClick = () => {
    router.push('/wiki/help');
    setIsMobileMenuOpen(false);
  };

  const handleProfileClick = () => {
    router.push('/admin/profile');
    setIsDropdownOpen(false);
  };

  const handleSettingsClick = () => {
    router.push('/admin/settings');
    setIsDropdownOpen(false);
  };

  const handleLogoutClick = () => {
    logout();
    router.push('/signin');
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Left Section */}
        <div className={styles.leftSection}>
          <button 
            className={styles.backButton}
            onClick={onBackClick}
          >
            <ChevronLeft size={20} />
            <span>Back</span>
          </button>
          
          <div className={styles.titleSection}>
            <div className={styles.logo}>
              <Book size={24} />
            </div>
            <div>
              <h1 className={styles.title}>{title}</h1>
              <p className={styles.subtitle}>FocusWord Documentation</p>
            </div>
          </div>
        </div>

        {/* Center Section - Search */}
        {showSearch && (
          <div className={styles.centerSection}>
            <div className={styles.searchContainer}>
              <Search size={18} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={handleSearchChange}
                className={styles.searchInput}
              />
            </div>
          </div>
        )}

        {/* Right Section */}
        <div className={styles.rightSection}>
          {/* Mobile Menu Toggle */}
          <button 
            className={styles.mobileMenuToggle}
            onClick={toggleMobileMenu}
          >
            <Menu size={20} />
          </button>

          {/* User Section */}
          <div className={styles.userSection} onClick={toggleDropdown}>
            <div className={styles.userAvatar}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="User Avatar" className={styles.avatarImage} />
              ) : (
                <User size={18} />
              )}
            </div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>{userName}</div>
              <div className={styles.userRole}>{user?.role?.name || 'User'}</div>
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
                  onClick={handleProfileClick}
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
                
                <div className={styles.dropdownDivider}></div>
                
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
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <div className={styles.mobileMenuHeader}>
            <h3>Navigation</h3>
            <button onClick={() => setIsMobileMenuOpen(false)}>
              <ChevronLeft size={20} />
            </button>
          </div>
          
          <nav className={styles.mobileNav}>
            <button className={styles.mobileNavItem} onClick={handleHomeClick}>
              <Home size={18} />
              <span>Home</span>
            </button>
            
            <button className={styles.mobileNavItem} onClick={handleArticlesClick}>
              <FileText size={18} />
              <span>Articles</span>
            </button>
            
            <button className={styles.mobileNavItem} onClick={handleHelpClick}>
              <HelpCircle size={18} />
              <span>Help</span>
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default WikiHeader;
