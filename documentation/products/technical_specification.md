# Technical Specification: "Products" Module

## 1. Architecture Overview

The product management module is implemented using a full-stack approach and is divided into two main parts:

1.  **Backend**: Written in **Nest.js**. Responsible for business logic, database interaction, API request processing, authentication, and caching.
2.  **Frontend**: Written in **Next.js** using **React**. Provides a user interface in the admin panel for managing products.

Interaction between the frontend and backend occurs via a REST API. **PostgreSQL** is used as the database, and **Prisma** is used for schema management and data access. **Redis** is used for caching requests.

## 2. Data Model (Database)

The main data model for products is defined in `backend/prisma/schema.prisma`.

### 2.1. `Product` Model

Describes the main product object.

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

*   **Fields**: `id`, `name`, `slug`, `description`, `price`, `status`, `createdAt`, `updatedAt`, `categoryId`.
*   **Relations**:
    *   `category`: An optional one-to-many relationship with the `ProductCategory` model.
    *   `reviews`: A one-to-many relationship with the `ProductReview` model.

### 2.2. `ProductCategory` Model

Describes product categories with hierarchy support.

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

### 2.3. `ProductReview` Model

Describes reviews left for products.

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

### 2.4. Discrepancy between Frontend and Backend

**Important Note:** During the analysis, a discrepancy was identified between the data sent by the frontend and the `Product` model defined in `schema.prisma` and in the controller's DTO.

*   The frontend component (`ProductsPage`) manages and sends the following fields to the backend: `sku`, `stock`, `images`.
*   However, the current Prisma schema and the typing in `ProductsController` and `ProductsService` **do not include** these fields.

This may lead to these data fields not being saved in the database or causing errors if the backend is not configured to accept them (e.g., via `Prisma.Json` or other mechanisms). For further development, it is necessary to synchronize the data models on the client and server.

## 3. Backend (API)

The backend provides a RESTful API for managing products.

*   **Controller**: `backend/src/app/products/products.controller.ts`
*   **Service**: `backend/src/app/products/products.service.ts`
*   **Base Path**: `/products`

### 3.1. Endpoints

| Method  | Path                  | Description                     | Authentication | Request Body / Parameters                                                                                             | Response                               |
| :------ | :-------------------- | :------------------------------ | :------------- | :------------------------------------------------------------------------------------------------------------------- | :------------------------------------- |
| `POST`  | `/`                   | Create a new product            | JWT            | `name`, `slug`, `description?`, `price`, `categoryId?`, `status?`                                                    | `Product`                              |
| `GET`   | `/`                   | Get a list of products          | None           | Query: `page?`, `limit?`, `search?`, `categoryId?`                                                                   | `{ data: Product[], total, ... }`      |
| `GET`   | `/slug/:slug`         | Get a product by `slug`         | None           | Param: `slug`                                                                                                        | `Product`                              |
| `GET`   | `/:id`                | Get a product by `ID`           | None           | Param: `id`                                                                                                          | `Product`                              |
| `PUT`   | `/:id`                | Update a product                | JWT            | Param: `id`, Body: `name?`, `slug?`, `description?`, `price?`, `categoryId?`, `status?`                                | `Product`                              |
| `DELETE`| `/:id`                | Delete a product                | JWT            | Param: `id`                                                                                                          | `void`                                 |
| `POST`  | `/:id/reviews`        | Add a review to a product       | None           | Param: `id`, Body: `name`, `email`, `message`, `rating`                                                              | `ProductReview`                        |
| `GET`   | `/:id/reviews`        | Get all reviews for a product   | None           | Param: `id`                                                                                                          | `ProductReview[]`                      |

### 3.2. Caching

The `ProductsService` uses **Redis** to cache GET requests to reduce the load on the database.

*   **Cached**:
    *   Responses to `findAll()` (list of products). The key is formed based on the request parameters: `products_{page}_{limit}_{search}_{categoryId}`.
    *   Responses to `findOne()` and `findBySlug()`. Keys: `product_{id}` and `product_slug_{slug}`.
*   **Cache Invalidation**:
    *   When `create()`, `update()`, `remove()`, or `addReview()` is called, the cache associated with the products is invalidated.
    *   The `invalidateCache()` method removes all keys matching the `products_*` pattern.
    *   When a specific product is updated or deleted, its individual cache (`product_{id}`, `product_slug_{slug}`) is also cleared.

## 4. Frontend

The user interface for managing products is located in the admin panel.

*   **Main Component**: `client/app/admin/products/page.tsx`
*   **Styles**: `client/app/admin/products/products.module.css`

### 4.1. `ProductsPage` Component Structure

*   The component is a client component (`"use client"`).
*   It uses `useState` and `useEffect` hooks to manage state:
    *   `products`: list of products.
    *   `loading`: loading state.
    *   `showModal`, `showDeleteModal`: manage the visibility of modal windows.
    *   `editingProduct`, `selectedProduct`: store the product for editing/deletion.
    *   `form`: state of the form fields for creating/editing.
*   **API Interaction**: is done through `productsApi` (imported from `@/src/entities/Product/api`).
*   **Authentication**: The `useAuth` hook is used to get the `accessToken`, which is required to perform protected requests (create, update, delete).

### 4.2. Key UI Components

*   **Table**: Displays a list of products with basic information.
*   **Search**: Product filtering is done on the client side by the `name` and `sku` fields.
*   **Modal Window (`Modal`)**: A universal component for displaying forms. Used for both creating and editing.
*   **`CategoryTreeSelect`**: A nested component that recursively builds a tree-like list of categories and allows you to select one of them. Categories are loaded from the backend and converted from a flat list to a tree on the client.

### 4.3. Data Lifecycle

1.  **Loading**: When the component mounts, `useEffect` calls `loadProducts()`, which requests the list of products from the backend via `productsApi`.
2.  **Create/Edit**:
    *   The user clicks "Add Product" or "Edit".
    *   `openCreate` or `openEdit` initialize the form state and open a modal window.
    *   `loadCategories` requests categories for the selector.
    *   When saving, `handleSaveProduct` forms a `payload` and sends it to the backend via `productsApi.createProduct` or `productsApi.updateProduct`.
    *   After successful saving, `loadProducts()` is called to update the list.
3.  **Deletion**:
    *   `handleDelete` opens a confirmation modal window.
    *   `confirmDelete` calls `productsApi.deleteProduct`, and then `loadProducts()`.
