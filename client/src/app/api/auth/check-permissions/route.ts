import { NextRequest, NextResponse } from 'next/server';

// Временная заглушка - в реальном приложении здесь должна быть проверка JWT токена
// и получение прав пользователя из базы данных или токена
const MOCK_USER_PERMISSIONS: Record<string, Record<string, number>> = {
  // userId -> { resource -> level }
  '1': {
    'media-files': 2,
    'sliders': 2,
    'records': 2,
    'record-categories': 2,
    'pages': 2,
    'users': 2,
    'roles': 2,
  },
  '2': {
    'media-files': 1,
    'sliders': 1,
    'pages': 1,
  },
};

// Временная функция для извлечения userId из токена (заглушка)
function extractUserIdFromToken(token: string): string | null {
  // В реальном приложении здесь будет верификация JWT
  // Пока просто возвращаем mock userId на основе токена
  if (token === 'mock-admin-token') return '1';
  if (token === 'mock-user-token') return '2';
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const { resource, minLevel } = await request.json();

    // Получаем токен из заголовка
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    // Извлекаем userId из токена
    const userId = extractUserIdFromToken(token);
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Получаем права пользователя
    const userPermissions = MOCK_USER_PERMISSIONS[userId] || {};
    const userPermissionLevel = userPermissions[resource] ?? -1;
    const hasPermission = userPermissionLevel >= minLevel;

    return NextResponse.json({ 
      hasPermission,
      userPermissionLevel,
      requiredLevel: minLevel,
      userId
    });

  } catch (error) {
    console.error('Error checking permissions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
