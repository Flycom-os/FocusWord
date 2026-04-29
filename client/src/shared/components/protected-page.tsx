'use client';

import React from 'react';
import withAuth from '@/src/shared/hoc/with-auth';

interface ProtectedPageProps {
  children: React.ReactNode;
}

// Фабрика для создания защищенных страниц
export const createProtectedPage = (resource: string, minLevel = 0, redirectTo = '/admin/settings') => {
  const ProtectedPage: React.FC<ProtectedPageProps> = ({ children }) => {
    // Просто рендерим children, реальная проверка происходит в HOC
    return <>{children}</>;
  };

  return withAuth(ProtectedPage, { resource, minLevel, redirectTo });
};

// Базовый компонент для динамического использования
const ProtectedPage: React.FC<ProtectedPageProps & { 
  resource: string; 
  minLevel?: number; 
  redirectTo?: string; 
}> = ({ children }) => {
  return <>{children}</>;
};

export default ProtectedPage;
