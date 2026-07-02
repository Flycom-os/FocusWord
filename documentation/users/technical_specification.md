# Users Module: Technical Specification

## 1. Overview

The Users module is a foundational component of the application, responsible for managing user identity, authentication, and access control. It is structured into three primary functional areas:

1.  **Public API:** Provides endpoints for user registration and login.
2.  **Self-Service API:** Offers secure endpoints for authenticated users to manage their own profiles.
3.  **Administration API & UI:** A restricted interface for administrators to manage all users and their associated roles within the system.

This module incorporates a robust Role-Based Access Control (RBAC) system to enforce permissions across various application resources.

## 2. Data Models (`User` & `Role`)

The core of the Users module relies on two Prisma models: `User` and `Role`.

### `User` Model

The `User` model stores all user-specific information, including authentication credentials and profile details.

```prisma
model User {
  id        Int       @id @default(autoincrement())
  email     String    @unique
  password  String    // Hashed password
  username  String?   @unique
  firstName String?
  lastName  String?
  // ... other profile fields like avatarUrl (e.g., avatarUrl String?)
  
  role   Role? @relation(fields: [roleId], references: [id])
  roleId Int?
  
  // ... relations to content authored by the user (e.g., posts Post[] or articles Article[])
}
```

-   `id`: Unique identifier for the user, auto-incremented.
-   `email`: User's email, must be unique across all users. Used for login.
-   `password`: Hashed version of the user's password for security.
-   `username`: Optional unique username, can also be used for login.
-   `firstName`, `lastName`: Optional fields for user's given and family names.
-   `roleId`: Foreign key linking to the `Role` model, determining the user's permissions.
-   `role`: Relation field to the `Role` model.

### `Role` Model

The `Role` model defines different access levels and their associated permissions, forming the basis of the RBAC system.

```prisma
model Role {
  id          Int      @id @default(autoincrement())
  name        String   @unique
  description String?
  permissions String[] // An array of permission strings
  // ...
}
```

-   `id`: Unique identifier for the role, auto-incremented.
-   `name`: Unique name of the role (e.g., "Admin", "Editor", "User").
-   `description`: Optional description of the role's purpose.
-   `permissions`: An array of strings, where each string represents a specific permission. These permissions follow a `resource:level` format (e.g., `users:0`, `users:1`, `users:2`), granting specific rights over a resource.
    -   `resource`: Refers to the module or entity (e.g., `users`, `articles`, `products`).
    -   `level`: Denotes the action or degree of access:
        -   `0`: Read access (e.g., `users:0` for viewing user lists).
        -   `1`: Update access (e.g., `users:1` for modifying user profiles).
        -   `2`: Create or delete access (e.g., `users:2` for creating new users or deleting existing ones).

## 3. Backend - Authentication API (`auth.controller.ts`)

The authentication API handles user login and registration processes.

### Endpoints

-   `POST /auth/login`:
    -   **Request Body:** Expects `identifier` (either email or username) and `password`.
    -   **Response:** On successful authentication, returns a JSON Web Token (JWT).
-   `POST /auth/register`:
    -   **Request Body:** Accepts user details (e.g., email, password, username, firstName, lastName) to create a new user account.
    -   **Logic:** Registers a new user, hashes their password, and typically assigns a default role.

### `AuthService` Logic

-   **Login (`signIn`):**
    1.  Retrieves the user from the database using the provided `identifier` (email or username).
    2.  Compares the provided plaintext `password` with the stored hashed password using `bcrypt.compare`.
    3.  If the password verification is successful, a unique JSON Web Token (JWT) is generated. This JWT contains the user's `id` and `roleId` (and potentially `permissions`) in its payload.
    4.  The generated JWT is returned to the client for subsequent authenticated requests.
-   **Registration (`register`):**
    1.  Validates that the provided email address is not already in use.
    2.  Hashes the plaintext password using `bcrypt.hash` before storage, ensuring sensitive data is never stored in plain text.
    3.  Creates a new `User` entry in the database with the hashed password and other provided details.
    4.  A default `roleId` is assigned to the new user upon registration.

## 4. Backend - User Management API (`user.controller.ts`)

The user management API provides endpoints for both administrative control over all users and self-service options for individual users to manage their own profiles.

### Admin Endpoints

These endpoints typically require higher-level permissions, enforced by the RBAC system.

-   `GET /user/all`:
    -   **Response:** Returns a paginated and searchable list of all user accounts in the system.
-   `POST /user`:
    -   **Request Body:** Accepts full user details to create a new user account.
    -   **Authorization:** Requires permissions such as `users:2` to create new users.
-   `GET /user/:id`:
    -   **Response:** Retrieves detailed information for a specific user identified by `id`.
-   `PATCH /user/:id`:
    -   **Request Body:** Accepts updated user details, including the ability to change a user's `roleId`.
    -   **Authorization:** Requires appropriate permissions (e.g., `users:1`) to modify user details.
-   `DELETE /user/:id`:
    -   **Authorization:** Requires high-level permissions (e.g., `users:2`) to delete a user account.

### Self-Service Endpoints

These endpoints allow authenticated users to manage their own data securely.

-   `GET /user/me`:
    -   **Response:** Returns the profile information of the currently authenticated user.
    -   **Security:** Leverages a `@GetUserId()` decorator to securely extract the `userId` from the authenticated JWT payload, ensuring users can only access their own profile data.
-   `PATCH /user/me`:
    -   **Request Body:** Accepts updated profile details for the current user.
    -   **Security:** Similar to `GET /user/me`, the `@GetUserId()` decorator ensures updates are applied only to the authenticated user's profile.
-   `DELETE /user/me`:
    -   **Security:** Allows the authenticated user to delete their own account, using the `userId` from the JWT payload.

### `UserService` Logic

The `UserService` encapsulates the business logic for user operations:

-   **Password Hashing:** Automatically hashes passwords for new user creation and when a user's password is changed.
-   **Password Stripping:** Ensures that the `password` hash field is always stripped from `User` objects before they are returned from any API endpoint, preventing sensitive data exposure.
-   **Caching:**
    -   Utilizes Redis for caching user data (`user_:{id}`) and lists of users (`users_:{query}`).
    -   Implements cache invalidation mechanisms on all write operations (create, update, delete) to ensure data consistency between the database and the cache.

## 5. Backend - Security and Authorization (RBAC)

Security and authorization are critical components, implemented through a combination of Guards and custom decorators.

### Guards

-   **`JwtAuthGuard`:**
    -   **Purpose:** This guard is applied at the controller or route level (`@UseGuards(JwtAuthGuard)`) to protect endpoints that require authentication.
    -   **Mechanism:** It intercepts incoming requests, validates the presence and authenticity of a JWT in the `Authorization` header, and, if valid, attaches the decoded user payload (containing `userId`, `roleId`, etc.) to the request object. If the JWT is missing or invalid, it throws an `UnauthorizedException`.
-   **`UsersGuard`:**
    -   **Purpose:** This guard works in conjunction with `JwtAuthGuard` to perform role-based authorization. It checks if the authenticated user has the necessary permissions to access a specific resource or perform an action.
    -   **Mechanism:** It's applied after `JwtAuthGuard` and relies on the user payload already being available in the request.

### RBAC Implementation

-   **`@Roles('resource:level')` Decorator:**
    -   **Purpose:** A custom decorator (e.g., `@Roles('users:2')`) used to attach permission metadata to specific route handlers or entire controllers. This metadata specifies the minimum required permission for an endpoint.
-   **Permission Scheme:**
    -   Permissions are strings following the `resource:level` format, as defined in the `Role` model.
    -   Examples:
        -   `users:0`: Grants read access to user data.
        -   `users:1`: Grants update access to user data.
        -   `users:2`: Grants create and delete access to user data.
-   **Authorization Flow:**
    1.  **Request Initiation:** An HTTP request targets a protected endpoint (e.g., `DELETE /user/:id`).
    2.  **Authentication (`JwtAuthGuard`):** The `JwtAuthGuard` is activated first. It validates the JWT from the request header and populates the request object with the authenticated user's details, including their `role` and `permissions`.
    3.  **Authorization (`UsersGuard`):** The `UsersGuard` is then activated.
        -   It retrieves the required permission string (e.g., `'users:2'`) from the endpoint's metadata, which was attached by the `@Roles()` decorator.
        -   It fetches the current user's `role` and its associated `permissions` array from the request object (provided by `JwtAuthGuard`).
        -   It iterates through the user's `permissions` array to check if the required permission string is present.
        -   If the required permission is found, the request is allowed to proceed to the route handler.
        -   If the required permission is not found in the user's `permissions` array, a `ForbiddenException` is thrown, preventing access.

## 6. Frontend Implementation (`users/index.tsx`)

The frontend component for user management provides a rich user interface for interacting with the backend APIs.

### UI Component

-   **Component Structure:** A stateful React component, likely located at `src/app/admin/users/page.tsx` (or similar for an admin section), provides the full UI for user management.
-   **Core Functionality:**
    -   Displays a paginated table of users, allowing for easy navigation through large datasets.
    -   Includes search functionality to filter users by various criteria (e.g., name, email, username).
    -   Features a modal interface for creating new users and editing existing user details.

### API Integration

-   **API Client Functions:** The component interacts with the backend through dedicated API client functions (e.g., `fetchUsers`, `createUser`, `updateUser`, `deleteUser`). These functions abstract away the HTTP requests and handle error processing.
-   **Role Management:** Calls a `fetchRoles` API function to retrieve a list of all available roles. This list is then used to populate a dropdown menu within the user creation/editing modal, allowing administrators to assign or change user roles.

### Client-Side Authorization

-   **`<PermissionGate>` Component:**
    -   **Purpose:** A dedicated React component (`<PermissionGate>`) is used to conditionally render UI elements based on the logged-in user's permissions. This ensures that users only see and interact with actions they are authorized to perform.
    -   **Mechanism:**
        1.  The logged-in user's permissions are typically stored in a global state management solution (e.g., React Context, Redux, Zustand) after a successful login.
        2.  The `<PermissionGate>` component accepts `resource` and `level` props (e.g., `<PermissionGate resource="users" level="2">`).
        3.  It compares the user's stored permissions against the required `resource` and `level`.
        4.  If the user possesses the sufficient permission, the component renders its children (e.g., an "Add New User" button or a "Delete" icon).
        5.  Otherwise, it renders nothing, effectively hiding unauthorized UI elements.
    -   **Benefit:** This declarative approach provides a clean and maintainable way to enforce RBAC on the frontend, enhancing the user experience by preventing unauthorized actions from even being visible.