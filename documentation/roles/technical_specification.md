# Roles Module Technical Specification

## 1. Overview

The Roles module is a critical component of the application, providing the foundational functionality for the Role-Based Access Control (RBAC) system. It offers a standard administrative interface for the creation, retrieval, updating, and deletion (CRUD) of `Role` entities. While architecturally a typical CRUD module, its significance lies in being the cornerstone of the application's authorization mechanism. Access to manage roles within this module is secured by a meta-permission system, ensuring that only users explicitly granted `roles` permissions can administer other roles.

## 2. Data Model (`Role`)

The `Role` data model is defined within `prisma.schema.prisma` and represents the structure for each role in the system.

```prisma
model Role {
  id          Int      @id @default(autoincrement())
  name        String   @unique
  description String?
  permissions String[] // Array of permission strings
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  users User[]
}
```

Key fields:
*   `id`: Unique identifier for the role, auto-incrementing integer.
*   `name`: Unique name of the role (e.g., "Administrator", "Editor", "Viewer").
*   `description`: Optional textual description of the role's purpose.
*   `permissions`: This is the most critical field. It is an array of strings, where each string represents a specific permission. These strings are typically formatted as `resource:level` (e.g., `pages:2`, `users:1`). The `RolesGuard` in the backend (and `PermissionGate` in the frontend) uses these strings to determine access rights for various application resources and actions.
*   `createdAt`: Timestamp of when the role was created.
*   `updatedAt`: Timestamp of the last update to the role.
*   `users`: A relation field indicating the users associated with this role, establishing a many-to-many relationship.

## 3. Backend Implementation

The backend implementation for the Roles module is built using NestJS, following a standard controller-service pattern.

### 3.1. `RoleController`

The `RoleController` (`backend/src/app/role/role.controller.ts`) exposes a RESTful API for managing roles. It provides the following endpoints:

*   **`GET /roles`**: Retrieves a paginated list of all roles.
*   **`GET /roles/:id`**: Retrieves a single role by its unique ID.
*   **`POST /roles`**: Creates a new role with the provided data.
*   **`PATCH /roles/:id`**: Updates an existing role identified by its ID.
*   **`DELETE /roles/:id`**: Deletes a role identified by its ID.

#### Security Implementation

The entire `RoleController` is protected by a robust security layer:

*   **`JwtAuthGuard`**: All endpoints require a valid JSON Web Token (JWT) to be present in the request header, ensuring that only authenticated users can access the module.
*   **`RolesGuard`**: Beyond authentication, this guard enforces role-based authorization. It checks the `permissions` array of the authenticated user's role against the permissions required by the specific endpoint.
*   **`@Roles()` Decorator**: Each endpoint within the controller is annotated with the `@Roles()` decorator. This decorator specifies the precise permission string(s) required to access that particular action. For instance:
    *   `@Roles('roles:2')` is used for `POST` (create) and `DELETE` operations, indicating a higher level of permission (e.g., write/delete access) for the `roles` resource.
    *   `@Roles('roles:1')` is used for `PATCH` (update) operations, indicating a lower level of permission (e.g., read/update access) for the `roles` resource.
    *   `GET` operations might have `@Roles('roles:0')` for read-only access or no decorator if publicly accessible to authenticated users.
This ensures that only users whose roles contain the specified `roles:X` permission can manage the roles system itself, establishing a hierarchical security model.

### 3.2. `RoleService`

The `RoleService` (`backend/src/app/role/role.service.ts`) acts as the business logic layer for the Roles module. It's a straightforward service that orchestrates data interactions.

*   **`PrismaService` Integration**: The service injects `PrismaService` to directly interact with the database, performing the actual CRUD operations (find, create, update, delete) on the `Role` model.
*   **Caching Strategy**: The `RoleService` adheres to the application's standard caching pattern using an injected Redis client.
    *   Results of `findAll` and `findOne` queries are cached to improve performance and reduce database load.
    *   Upon any `create`, `update`, or `delete` operation, the relevant caches for the Roles module are intelligently invalidated to ensure data consistency. This prevents stale data from being served from the cache after modifications.

## 4. Frontend Implementation

The frontend implementation for role management is encapsulated within a single React component, `RolesPage` (`client/src/app/admin/roles/page.tsx` or similar, based on `roles/index.tsx` hint).

### 4.1. Component Architecture

The `RolesPage` component is a stateful React component responsible for displaying, creating, editing, and deleting roles. Its design promotes a cohesive user experience for role management.

### 4.2. UI Features

*   **Paginated Table**: A `Table` component is used to display a list of roles. It includes pagination controls to efficiently handle a large number of roles.
*   **Modal for CRUD Operations**: A `Modal` component serves as a versatile interface for both creating new roles and editing existing ones. Its visibility and content are controlled by state variables such as `isModalOpen` (boolean) and `editingRole` (object, holds the role data if editing, or `null` for creation).

### 4.3. Permissions Management UI

A key aspect of the role creation/editing modal is the user interface for managing the `permissions` array:

*   **Permission Input**: An `<Input>` component (referred to as `permissionInput`) allows administrators to type in new permission strings (e.g., `users:2`, `products:1`).
*   **Add Button**: An "Add" button, when clicked, takes the value from `permissionInput` and pushes it into the component's internal `permissions` state array.
*   **Interactive Tags**: The `permissions` array is visually rendered as a series of "tags" or "chips." Each tag displays a single permission string. To facilitate removal, each tag includes a small "×" icon. Clicking this icon triggers an `onClick` handler that filters the `permissions` state array, removing the selected permission.

### 4.4. Client-Side Authorization

The frontend leverages the `<PermissionGate>` component to enforce RBAC rules directly within the UI, providing a dynamic and responsive user experience based on the logged-in user's permissions.

*   **`PermissionGate` Component**: Buttons or UI sections that require specific permissions (e.g., "Add Role," "Edit" button for a specific role, "Delete" button) are wrapped with `<PermissionGate resource="roles" level={...}>`.
*   **Declarative Enforcement**: This component declaratively checks the user's permissions against the `resource` and `level` props. If the user does not possess the required permission, the wrapped UI element (button, section) is either hidden or disabled, ensuring the UI dynamically adapts and prevents unauthorized actions. For example, the "Add Role" button might be wrapped with `<PermissionGate resource="roles" level={2}>` to require a write permission on the `roles` resource.
This client-side authorization complements the backend `RolesGuard`, providing immediate visual feedback and a more secure application.