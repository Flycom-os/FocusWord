import React from 'react';
import styles from './ui-site-header.module.css';
import { ChevronLeft, ChevronDown } from 'lucide-react';

interface HeaderProps {
  onBackClick?: () => void;
  userName?: string;
  onUserMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onBackClick,
  userName = 'John John',
  onUserMenuClick,
}) => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <button 
          className={styles.backButton}
          onClick={onBackClick}
        >
          <ChevronLeft size={20} />
          <span>Назад</span>
        </button>
        
        <div className={styles.userSection}>
          <div className={styles.userName}>{userName}</div>
          <button 
            className={styles.dropdownButton}
            onClick={onUserMenuClick}
          >
            {/*<ChevronDown size={16} />*/}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
