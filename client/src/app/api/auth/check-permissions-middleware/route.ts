import { NextRequest, NextResponse } from 'next/server';

// Этот endpoint используется middleware для проверки прав доступа
// Он должен делать запрос к реальному API для верификации JWT

export async function POST(request: NextRequest) {
  try {
    const { resource, minLevel } = await request.json();

    // Получаем токен из заголовка
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    // Запрос к реальному API для проверки токена и прав
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1331';
    
    try {
      const response = await fetch(`${apiUrl}/api/auth/verify-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ resource, minLevel }),
      });

      if (!response.ok) {
        console.log('Backend API verification failed:', response.status);
        return NextResponse.json({ hasPermission: false, error: 'Token verification failed' });
      }

      const data = await response.json();
      return NextResponse.json(data);

    } catch (fetchError) {
      console.log('Backend API unavailable, using fallback logic');
      
      // Fallback: если backend недоступен, делаем базовую проверку
      // Это временная мера для разработки
      if (token.includes('admin') || token.includes('full')) {
        return NextResponse.json({ hasPermission: true, source: 'fallback-admin' });
      }
      
      if (token.includes('guest') || token.includes('user')) {
        // Гости и обычные пользователи не имеют прав на защищенные ресурсы
        return NextResponse.json({ hasPermission: false, source: 'fallback-guest' });
      }
      
      return NextResponse.json({ hasPermission: false, source: 'fallback-default' });
    }

  } catch (error) {
    console.error('Error in check-permissions-middleware:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
