# Technical Specification: Product Categories

## 1. Architecture Overview

The "Product Categories" module follows the project's standard architecture, consisting of a Nest.js backend for data management and a Next.js/React frontend for displaying it in the admin panel. Interaction is carried out via a REST API.

## 2. Data Model (Database)

The `ProductCategory` model is defined in `backend/prisma/schema.prisma` and is key to this module.

```prisma
model ProductCategory {
  id          Int      @id @default(autoincrement())
  name        String
  slug        String   @unique
  description String?
  status      String   @default("active")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Fields for implementing hierarchy
  parentId    Int?
  parent      ProductCategory?  @relation("ProductCategoryHierarchy", fields: [parentId], references: [id])
  children    ProductCategory[] @relation("ProductCategoryHierarchy")

  // Relation to products
  products    Product[] @relation("ProductToCategory")
}
```

*   **Hierarchy**: Implemented via the optional `parentId` field, which refers to the `id` of the parent category in the same table. This allows for an unlimited level of nesting.
*   **Relations**: In addition to the self-join for the hierarchy, the model is linked to `Product`, which allows tracking which products belong to which category.

## 3. Backend (API)

*   **Controller**: `backend/src/app/product-categories/product-categories.controller.ts`
*   **Service**: `backend/src/app/product-categories/product-categories.service.ts`
*   **Base Path**: `/product-categories`

### 3.1. Endpoints

The API provides a standard set of CRUD operations:

| Method    | Path   | Description               | Authentication | Request Body / Parameters                                                                  |
| :-------- | :----- | :------------------------ | :------------- | :------------------------------------------------------------------------------------------- |
| `POST`    | `/`    | Create a category         | JWT            | `name`, `slug`, `description?`, `parentId?`, `status?`                                       |
| `GET`     | `/`    | Get all categories        | None           | Query: `page?`, `limit?`, `search?` (Returns a **flat list**)                               |
| `GET`     | `/:id` | Get a category by ID      | None           | Param: `id`                                                                                  |
| `PUT`     | `/:id` | Update a category         | JWT            | Param: `id`, Body: `name?`, `slug?`, `description?`, `parentId?`, `status?`                   |
| `DELETE`  | `/:id` | Delete a category         | JWT            | Param: `id`                                                                                  |

### 3.2. Backend Logic and Potential Issues

*   **Caching**: The `ProductCategoriesService` uses Redis to cache `findAll` and `findOne` responses for improved performance. The cache is invalidated on create, update, or delete operations.
*   **Hierarchy Handling**: The backend service does not perform any special hierarchy processing. `findAll` returns a flat list of categories. It is assumed that the tree is built on the client side.
*   **Cascading Delete Problem**: The `remove()` method performs a simple deletion of the record from the database (`prisma.productCategory.delete`). The Prisma schema does not define `onDelete` rules for child categories or related products. This means that:
    *   Deleting a parent category can lead to "orphaned" child categories (if the DB is not configured for cascading deletes at the foreign key level).
    *   Products associated with the deleted category are not processed and may be left with a reference to a non-existent category.
    **Recommendation**: Add logic to the service to handle child elements and related products upon deletion.

## 4. Frontend

*   **Main Component**: `client/app/admin/product-categories/page.tsx`

### 4.1. `ProductCategoriesPage` Component Structure

*   The component is a client component (`"use client"`).
*   **Tree Rendering**: The main display logic is encapsulated in the recursive `renderCategory` function. It iterates through categories and their children (`category.children`), creating the illusion of a tree in a flat HTML table using CSS indentation.
*   **State Management**:
    *   `categories`: Stores the full list of categories as a tree.
    *   `expandedCategories`: A `Set` that contains the `id` of currently expanded categories, allowing for collapsing/expanding tree nodes.
*   **API Interaction**:
    *   The component uses `productsApi.getCategories()` to retrieve data. Based on the code, this method is expected to return an already constructed category tree, which is inconsistent with the `findAll` implementation on the backend. It is likely that `productsApi` contains additional logic to transform the flat list into a tree or calls another, undiscovered endpoint.
    *   The use of `@ts-ignore` indicates possible type mismatches between the API client and the expected data.

### 4.2. Incomplete Functionality

The current implementation of the frontend component is missing critical functionality:

*   **Create Category**: The "Add Category" button does not have an `onClick` handler. The modal window and creation form are not implemented.
*   **Edit Category**: The "Edit" button in the category row also has no handler.

Thus, the page is currently **read-only** with the ability to delete. For full functionality, implementation of forms and modal windows for creating and editing categories, as well as the corresponding API calls, is required.
