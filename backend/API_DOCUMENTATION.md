# API Документация - Цветочный магазин

## Пользователи (User API)

### Получить информацию о текущем пользователе
```
GET /user/me
Authorization: Bearer <token>
```
Возвращает полную информацию о пользователе включая корзину, заказы, комментарии и адреса.

### Получить всех пользователей с поиском
```
GET /user/all?name=John&page=0&limit=10
Authorization: Bearer <token>
```
Параметры:
- `name` (опционально) - поиск по имени, фамилии или email
- `page` (опционально) - номер страницы (по умолчанию 0)
- `limit` (опционально) - количество элементов на странице (по умолчанию 10)

### Обновить данные текущего пользователя
```
PATCH /user/me
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "name": "Новое имя",
  "surname": "Новая фамилия",
  "phone": "+7900123456",
  "email": "new@example.com",
  "face": <файл изображения>
}
```

### Удалить текущего пользователя
```
DELETE /user/me
Authorization: Bearer <token>
```

### Получить пользователя по ID
```
GET /user/:id
Authorization: Bearer <token>
```

### Обновить пользователя по ID
```
PATCH /user/:id
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

### Удалить пользователя по ID
```
DELETE /user/:id
Authorization: Bearer <token>
```

## Корзина (Cart API)

### Получить корзину пользователя
```
GET /cart
Authorization: Bearer <token>
```

### Добавить товар в корзину
```
POST /cart/add
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": 1,
  "quantity": 2
}
```

### Обновить количество товара в корзине
```
PATCH /cart/item/:itemId
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 3
}
```

### Удалить товар из корзины
```
DELETE /cart/item/:itemId
Authorization: Bearer <token>
```

### Очистить корзину
```
DELETE /cart/clear
Authorization: Bearer <token>
```

## Заказы (Orders API)

### Создать новый заказ
```
POST /orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "address": "ул. Пушкина, д. 1",
  "date_delivery": "2024-01-15",
  "total_service": "1000",
  "items": [
    {
      "productId": 1,
      "quantity": 2
    },
    {
      "productId": 3,
      "quantity": 1
    }
  ]
}
```

### Получить заказы с фильтрацией
```
GET /orders?userId=1&status=pending&page=0&limit=10
Authorization: Bearer <token>
```
Параметры:
- `userId` (опционально) - фильтр по пользователю
- `status` (опционально) - фильтр по статусу заказа
- `page` (опционально) - номер страницы
- `limit` (опционально) - количество элементов на странице

### Получить заказы текущего пользователя
```
GET /orders/my?status=pending&page=0&limit=10
Authorization: Bearer <token>
```

### Получить заказ по ID
```
GET /orders/:id
Authorization: Bearer <token>
```

### Обновить заказ
```
PATCH /orders/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "processing",
  "address": "Новый адрес",
  "date_delivery": "2024-01-20",
  "total_service": "1200"
}
```

### Удалить заказ
```
DELETE /orders/:id
Authorization: Bearer <token>
```

## Адреса (Address API)

### Создать новый адрес
```
POST /address
Authorization: Bearer <token>
Content-Type: application/json

{
  "address": "ул. Пушкина, д. 1, кв. 10"
}
```

### Получить адреса с фильтрацией
```
GET /address?userId=1&page=0&limit=10
Authorization: Bearer <token>
```
Параметры:
- `userId` (опционально) - фильтр по пользователю
- `page` (опционально) - номер страницы
- `limit` (опционально) - количество элементов на странице

### Получить адреса текущего пользователя
```
GET /address/my?page=0&limit=10
Authorization: Bearer <token>
```

### Получить адрес по ID
```
GET /address/:id
Authorization: Bearer <token>
```

### Обновить адрес
```
PATCH /address/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "address": "ул. Ленина, д. 5, кв. 20"
}
```

### Удалить адрес
```
DELETE /address/:id
Authorization: Bearer <token>
```

## Статусы заказов

- `pending` - ожидает обработки
- `processing` - в обработке
- `shipped` - отправлен
- `delivered` - доставлен
- `cancelled` - отменен

## Ответы API

### Успешный ответ
```json
{
  "success": true,
  "data": { ... }
}
```

### Ошибка
```json
{
  "success": false,
  "message": "Описание ошибки",
  "statusCode": 400
}
```

### Пагинация
```json
{
  "data": [...],
  "total": 100,
  "page": 0,
  "limit": 10,
  "totalPages": 10
}
```

## Аутентификация

Все API (кроме аутентификации) требуют JWT токен в заголовке:
```
Authorization: Bearer <your-jwt-token>
```

## Загрузка файлов

Для загрузки изображений используйте `multipart/form-data` с полем `face`.
