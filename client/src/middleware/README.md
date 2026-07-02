# Middleware для проверки прав доступа

Этот middleware обеспечивает защиту маршрутов на основе прав доступа пользователей.

## Как это работает

1. **Middleware** перехватывает все запросы к страницам админ-панели
2. **Проверяет маршрут** по конфигурации в `routes.ts`
3. **Проверяет права** пользователя через API endpoint `/api/auth/check-permissions`
4. **Перенаправляет** на страницу доступа запрещен, если прав недостаточно

## Структура файлов

```
src/middleware/
├── middleware.ts          # Основной middleware
├── routes.ts             # Конфигурация маршрутов
└── README.md             # Документация

src/app/api/auth/check-permissions/
└── route.ts              # API endpoint для проверки прав

src/app/ui/
└── access-denied.tsx     # Компонент страницы доступа запрещен

src/app/admin/access-denied/
└── page.ts              # Страница доступа запрещен
```

## Конфигурация маршрутов

В `routes.ts` можно настроить защищенные маршруты:

```typescript
export const protectedRoutes: Record<string, RouteConfig> = {
  '/admin/media-files': { resource: 'media-files', minLevel: 0 },
  '/admin/users': { resource: 'users', minLevel: 1 },
  '/admin/roles': { resource: 'roles', minLevel: 2 },
};
```

## Уровни доступа

- **Level 0**: Только просмотр
- **Level 1**: Просмотр и редактирование
- **Level 2**: Полные права включая удаление

## Публичные маршруты

Эти маршруты не требуют проверки прав:

```typescript
export const publicRoutes = [
  '/',
  '/admin/login',
  '/admin/profile',
  '/admin/settings',
  '/admin/access-denied',
];
```

## API Endpoint

`POST /api/auth/check-permissions`

Тело запроса:
```json
{
  "resource": "media-files",
  "minLevel": 1
}
```

Заголовки:
```
Authorization: Bearer <token>
```

Ответ:
```json
{
  "hasPermission": true,
  "userPermissionLevel": 2,
  "requiredLevel": 1,
  "userId": "1"
}
```

## Установка и настройка

1. **Установить jsonwebtoken** (когда будет доступен npm):
   ```bash
   npm install jsonwebtoken @types/jsonwebtoken
   ```

2. **Настроить JWT_SECRET** в переменных окружения

3. **Заменить заглушку** в `check-permissions/route.ts` на реальную проверку JWT

4. **Настроить права** в соответствии с вашей системой авторизации

## Тестирование

Для тестирования можно использовать mock токены:
- `mock-admin-token` - пользователь с полными правами (userId: 1)
- `mock-user-token` - пользователь с ограниченными правами (userId: 2)

## Безопасность

- Middleware работает на сервере до загрузки страницы
- Все проверки прав происходят до рендеринга компонентов
- Невалидные токены блокируются на уровне middleware
- Публичные маршруты исключены из проверок
