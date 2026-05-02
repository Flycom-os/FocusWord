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
    <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50">
      <div className="max-w-[1024px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <button 
            className="flex items-center gap-2 text-gray-700 hover:text-black transition-colors duration-200 font-medium text-sm group"
            onClick={onBackClick}
          >
            <ChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform duration-200" />
            <span>Назад</span>
          </button>
          
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium text-gray-900">{userName}</div>
            <button 
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors duration-200"
              onClick={onUserMenuClick}
            >
              {/*<ChevronDown size={16} />*/}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
