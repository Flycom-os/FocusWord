'use client';

import { useEffect } from 'react';
import { useAuth } from './providers/auth-provider';

// Этот компонент устанавливает заголовки авторизации для middleware
export function AuthHeadersProvider({ children }: { children: React.ReactNode }) {
  const { accessToken } = useAuth();

  useEffect(() => {
    // Устанавливаем заголовок для middleware через специальный cookie
    // Это обходной путь, так как middleware не имеет доступа к localStorage
    if (accessToken) {
      document.cookie = `auth-token=${accessToken}; path=/; max-age=3600; SameSite=Lax`;
    } else {
      document.cookie = 'auth-token=; path=/; max-age=0; SameSite=Lax';
    }
  }, [accessToken]);

  return <>{children}</>;
}
