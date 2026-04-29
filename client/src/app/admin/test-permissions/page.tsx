'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/src/app/providers/auth-provider';

export default function TestPermissionsPage() {
  const { accessToken, user, hasPermission } = useAuth();
  const [cookieValue, setCookieValue] = useState<string>('');

  useEffect(() => {
    // Проверяем значение cookie для отладки
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(c => c.trim().startsWith('auth-token='));
    setCookieValue(authCookie ? authCookie.split('=')[1] : 'Not found');
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Тест прав доступа</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <h2 className="font-semibold mb-2">Информация об авторизации:</h2>
        <p><strong>Пользователь:</strong> {user?.email || 'Не авторизован'}</p>
        <p><strong>Токен в localStorage:</strong> {accessToken ? accessToken.substring(0, 20) + '...' : 'Нет'}</p>
        <p><strong>Токен в cookie:</strong> {cookieValue ? cookieValue.substring(0, 20) + '...' : 'Нет'}</p>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <h2 className="font-semibold mb-2">Проверка прав:</h2>
        <p><strong>Media files (level 0):</strong> {hasPermission('media-files', 0) ? '✅ Есть' : '❌ Нет'}</p>
        <p><strong>Media files (level 1):</strong> {hasPermission('media-files', 1) ? '✅ Есть' : '❌ Нет'}</p>
        <p><strong>Media files (level 2):</strong> {hasPermission('media-files', 2) ? '✅ Есть' : '❌ Нет'}</p>
        <p><strong>Users (level 0):</strong> {hasPermission('users', 0) ? '✅ Есть' : '❌ Нет'}</p>
        <p><strong>Users (level 2):</strong> {hasPermission('users', 2) ? '✅ Есть' : '❌ Нет'}</p>
      </div>

      <div className="bg-yellow-100 p-4 rounded-lg">
        <h2 className="font-semibold mb-2">Инструкции для тестирования middleware:</h2>
        <ol className="list-decimal list-inside space-y-1">
          <li>Откройте консоль браузера</li>
          <li>Попробуйте перейти напрямую на: /admin/media-files</li>
          <li>Попробуйте перейти напрямую на: /admin/users</li>
          <li>Посмотрите логи в консоли сервера</li>
          <li>Если middleware работает, вы должны увидеть логи проверки прав</li>
        </ol>
      </div>
    </div>
  );
}
