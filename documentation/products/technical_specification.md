# Техническая спецификация: Модуль "Products"

## 1. Обзор архитектуры

Модуль управления продуктами реализован с использованием full-stack подхода и разделен на две основные части:

1.  **Бэкенд (Backend)**: Написан на **Nest.js**. Отвечает за бизнес-логику, взаимодействие с базой данных, обработку API-запросов, аутентификацию и кэширование.
2.  **Фронтенд (Frontend)**: Написан на **Next.js** с использованием **React**. Предоставляет пользовательский интерфейс в административной панели для управления продуктами.

Взаимодействие между фронтендом и бэкендом происходит через REST API. В качестве базы данных используется **PostgreSQL**, а для управления схемой и доступом к данным — **Prisma**. Для кэширования запросов применяется **Redis**.

## 2. Модель данных (База данных)

Основная модель данных для продуктов определена в `backend/prisma/schema.prisma`.

### 2.1. Модель `Product`

Описывает основной объект продукта.

```prisma
model Product {
  id          Int      @id @default(autoincrement())
  name        String
  slug        String   @unique
  description String?
  price       Float
  status      String   @default("active")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  categoryId  Int?
  category    ProductCategory? @relation("ProductToCategory", fields: [categoryId], references: [id])

  reviews     ProductReview[]
}
```

*   **Поля**: `id`, `name`, `slug`, `description`, `price`, `status`, `createdAt`, `updatedAt`, `categoryId`.
*   **Связи**:
    *   `category`: Опциональная связь "один-ко-многим" с моделью `ProductCategory`.
    *   `reviews`: Связь "один-ко-многим" с моделью `ProductReview`.

### 2.2. Модель `ProductCategory`

Описывает категории продуктов с поддержкой иерархии.

```prisma
model ProductCategory {
  id          Int      @id @default(autoincrement())
  name        String
  slug        String   @unique
  description String?
  status      String   @default("active")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  parentId    Int?
  parent      ProductCategory?  @relation("ProductCategoryHierarchy", fields: [parentId], references: [id])
  children    ProductCategory[] @relation("ProductCategoryHierarchy")

  products    Product[] @relation("ProductToCategory")
}
```

### 2.3. Модель `ProductReview`

Описывает отзывы, оставленные к продуктам.

```prisma
model ProductReview {
  id        Int      @id @default(autoincrement())
  name      String
  email     String
  message   String
  rating    Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  productId Int
  product   Product @relation(fields: [productId], references: [id])
}
```

### 2.4. Расхождение между Фронтендом и Бэкендом

**Важное замечание:** В ходе анализа было выявлено несоответствие между данными, которые отправляет фронтенд, и моделью `Product`, определенной в `schema.prisma` и в DTO контроллера.

*   Фронтенд-компонент (`ProductsPage`) управляет и отправляет на бэкенд следующие поля: `sku`, `stock`, `images`.
*   Однако, текущая схема Prisma и типизация в `ProductsController` и `ProductsService` **не включают** эти поля.

Это может приводить к тому, что данные поля не сохраняются в базе данных или вызывают ошибки, если бэкенд не настроен на их прием (например, через `Prisma.Json` или другие механизмы). При дальнейшей разработке необходимо синхронизировать модели данных на клиенте и сервере.

## 3. Бэкенд (API)

Бэкенд предоставляет RESTful API для управления продуктами.

*   **Контроллер**: `backend/src/app/products/products.controller.ts`
*   **Сервис**: `backend/src/app/products/products.service.ts`
*   **Базовый путь**: `/products`

### 3.1. Эндпоинты

| Метод  | Путь                  | Описание                        | Аутентификация | Тело запроса / Параметры                                                                                             | Ответ                                  |
| :----- | :-------------------- | :------------------------------ | :------------- | :------------------------------------------------------------------------------------------------------------------- | :------------------------------------- |
| `POST` | `/`                   | Создать новый продукт           | JWT            | `name`, `slug`, `description?`, `price`, `categoryId?`, `status?`                                                    | `Product`                              |
| `GET`  | `/`                   | Получить список продуктов       | Нет            | Query: `page?`, `limit?`, `search?`, `categoryId?`                                                                   | `{ data: Product[], total, ... }`      |
| `GET`  | `/slug/:slug`         | Получить продукт по `slug`      | Нет            | Param: `slug`                                                                                                        | `Product`                              |
| `GET`  | `/:id`                | Получить продукт по `ID`        | Нет            | Param: `id`                                                                                                          | `Product`                              |
| `PUT`  | `/:id`                | Обновить продукт                | JWT            | Param: `id`, Body: `name?`, `slug?`, `description?`, `price?`, `categoryId?`, `status?`                                | `Product`                              |
| `DELETE`| `/:id`               | Удалить продукт                 | JWT            | Param: `id`                                                                                                          | `void`                                 |
| `POST` | `/:id/reviews`        | Добавить отзыв к продукту       | Нет            | Param: `id`, Body: `name`, `email`, `message`, `rating`                                                              | `ProductReview`                        |
| `GET`  | `/:id/reviews`        | Получить все отзывы продукта    | Нет            | Param: `id`                                                                                                          | `ProductReview[]`                      |

### 3.2. Кэширование

Сервис `ProductsService` использует **Redis** для кэширования GET-запросов, чтобы снизить нагрузку на базу данных.

*   **Кэшируются**:
    *   Ответы на `findAll()` (список продуктов). Ключ формируется на основе параметров запроса: `products_{page}_{limit}_{search}_{categoryId}`.
    *   Ответы на `findOne()` и `findBySlug()`. Ключи: `product_{id}` и `product_slug_{slug}`.
*   **Инвалидация кэша**:
    *   При вызове `create()`, `update()`, `remove()` или `addReview()` кэш, связанный с продуктами, инвалидируется.
    *   Метод `invalidateCache()` удаляет все ключи, соответствующие паттерну `products_*`.
    *   При обновлении или удалении конкретного продукта его индивидуальный кэш (`product_{id}`, `product_slug_{slug}`) также очищается.

## 4. Фронтенд

Пользовательский интерфейс для управления продуктами находится в административной панели.

*   **Основной компонент**: `client/app/admin/products/page.tsx`
*   **Стили**: `client/app/admin/products/products.module.css`

### 4.1. Структура компонента `ProductsPage`

*   Компонент является клиентским (`"use client"`).
*   Использует хуки `useState` и `useEffect` для управления состоянием:
    *   `products`: список продуктов.
    *   `loading`: состояние загрузки.
    *   `showModal`, `showDeleteModal`: управление видимостью модальных окон.
    *   `editingProduct`, `selectedProduct`: хранение продукта для редактирования/удаления.
    *   `form`: состояние полей формы для создания/редактирования.
*   **API-взаимодействие**: осуществляется через `productsApi` (импортируется из `@/src/entities/Product/api`).
*   **Аутентификация**: Хук `useAuth` используется для получения `accessToken`, который необходим для выполнения защищенных запросов (создание, обновление, удаление).

### 4.2. Ключевые UI-компоненты

*   **Таблица**: Отображает список продуктов с основной информацией.
*   **Поиск**: Фильтрация продуктов происходит на стороне клиента по полям `name` и `sku`.
*   **Модальное окно (`Modal`)**: Универсальный компонент для отображения форм. Используется как для создания, так и для редактирования.
*   **`CategoryTreeSelect`**: Вложенный компонент, который рекурсивно строит древовидный список категорий и позволяет выбрать одну из них. Категории загружаются с бэкенда и преобразуются из плоского списка в дерево на клиенте.

### 4.3. Жизненный цикл данных

1.  **Загрузка**: При монтировании компонента `useEffect` вызывает `loadProducts()`, которая через `productsApi` запрашивает список продуктов с бэкенда.
2.  **Создание/Редактирование**:
    *   Пользователь нажимает "Add Product" или "Edit".
    *   `openCreate` или `openEdit` инициализируют состояние формы и открывают модальное окно.
    *   `loadCategories` запрашивает категории для селектора.
    *   При сохранении `handleSaveProduct` формирует `payload` и отправляет его на бэкенд через `productsApi.createProduct` или `productsApi.updateProduct`.
    *   После успешного сохранения вызывается `loadProducts()` для обновления списка.
3.  **Удаление**:
    *   `handleDelete` открывает модальное окно подтверждения.
    *   `confirmDelete` вызывает `productsApi.deleteProduct`, а затем `loadProducts()`.
