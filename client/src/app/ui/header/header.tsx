'use client';

import React from 'react';
import { DropdownMenu } from '@/src/app/ui/dropdown-menu';
import { useAuth } from "@/src/app/providers/auth-provider";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronLeft } from "lucide-react";

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : "Guest";

  const handleSettingsClick = () => {
    router.push("/admin/profile");
  };

  const handleLogoutClick = () => {
    logout();
    router.push("/signin");
  };

  return (
    <header className="bg-white border-b border-purple-200 px-4 py-3 flex justify-between items-center">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-700 hover:bg-purple-50 px-3 py-2 rounded-md transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="text-sm font-medium">Все записи</span>
      </button>
      
      <DropdownMenu 
        trigger={
          <button className="flex items-center gap-1 text-gray-700 hover:bg-purple-50 px-3 py-2 rounded-md transition-colors">
            <span className="text-sm font-medium">{userName}</span>
            <ChevronDown className="h-4 w-4" />
          </button>
        }
      >
        <button
          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50"
          role="menuitem"
          onClick={handleSettingsClick}
        >
          Settings
        </button>
        <button
          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50"
          role="menuitem"
          onClick={handleLogoutClick}
        >
          Logout
        </button>
      </DropdownMenu>
    </header>
  );
};

export default Header;
