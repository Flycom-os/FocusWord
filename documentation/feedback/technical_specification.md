# Technical Specification: Feedback Module

## 1. Overview
The Feedback module allows users to submit feedback (e.g., complaints, suggestions, questions, compliments) which can then be reviewed and managed by administrators. This document details the technical implementation of both the backend API and the frontend administration interface for handling user feedback.

## 2. Data Model

### 2.1. Prisma Schema (`Feedback` table)
The backend data model for feedback is defined in `backend/prisma/schema.prisma`:

```prisma
model Feedback {
  id        Int      @id @default(autoincrement())
  name      String
  email     String
  message   String
  rating    Int?
  status    String   @default("pending")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

This model captures basic information about feedback submissions:
- `id`: Unique identifier for the feedback.
- `name`: Name of the user submitting feedback.
- `email`: Email of the user submitting feedback.
- `message`: The actual feedback content.
- `rating`: An optional numerical rating.
- `status`: Current status of the feedback, defaulting to "pending".
- `createdAt`: Timestamp of creation.
- `updatedAt`: Timestamp of the last update.

### 2.2. Frontend Interface (`Feedback` type)
The frontend expects a richer data structure for feedback items, as defined in `client/src/entities/Feedback/index.ts`:

```typescript
export interface Feedback {
  id: string;
  title: string;
  description: string;
  type: "complaint" | "suggestion" | "question" | "compliment";
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "closed";
  userId: string;
  user?: { id: string; name: string; email: string; };
  assignedToId?: string;
  assignedTo?: { id: string; name: string; email: string; };
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  tags: string[];
  attachments: string[];
}
```

This interface includes fields like `title`, `description`, `type`, `priority`, `userId`, `user` object, `assignedToId`, `assignedTo` object, `resolvedAt`, `tags`, and `attachments`, which are not present in the backend Prisma schema.

### 2.3. Data Inconsistency
There is a significant inconsistency between the frontend `Feedback` interface and the backend Prisma `Feedback` model.
- **Missing Backend Fields**: The backend model lacks several fields expected by the frontend, including `title`, `description`, `type`, `priority`, `userId`, `user`, `assignedToId`, `assignedTo`, `resolvedAt`, `tags`, and `attachments`.
- **Field Mapping**:
    - Frontend `id` (string) maps to backend `id` (Int).
    - Frontend `description` or `title` is mapped from backend `message` in some UI rendering logic (e.g., `item.title || item.name` and `item.description || item.message`).
    - Frontend `status` maps to backend `status`.
    - Frontend `createdAt` and `updatedAt` map directly.
- **Implications**: Due to these discrepancies, several frontend features, such as filtering by `type`, `priority`, or `tags`, displaying assigned users, or managing attachments, cannot function correctly or are not supported by the current backend implementation. The frontend admin page (`client/app/admin/feedback/page.tsx`) uses fallbacks to display data (e.g., `item.title || item.name`), indicating that fields like `title` and `description` are not consistently provided by the API.

## 3. Backend Implementation

### 3.1. API Endpoints
The `FeedbackController` (`backend/src/app/feedback/feedback.controller.ts`) exposes the following API endpoints:

-   **`POST /feedback`**
    -   **Purpose**: Creates a new feedback entry.
    -   **Permissions**: No explicit `@HasPermission` decorator, implying it's accessible without specific permissions (likely public for user submissions).
    -   **Payload**: Expects a JSON body with `name`, `email`, `message`, and optionally `rating`.
    -   **Response**: Returns the newly created feedback object from the database.
    -   **Code**:
        ```typescript
        @Post()
        create(@Body() dto: any) {
          return this.feedbackService.create(dto);
        }
        ```

-   **`GET /feedback`**
    -   **Purpose**: Retrieves all feedback entries.
    -   **Permissions**: Requires `JwtAuthGuard` and `PermissionsGuard` with `feedback:0` permission.
    -   **Response**: Returns an array of feedback objects, ordered by `createdAt` in descending order.
    -   **Code**:
        ```typescript
        @UseGuards(JwtAuthGuard, PermissionsGuard)
        @Get()
        @HasPermission('feedback:0')
        findAll() {
          return this.feedbackService.findAll();
        }
        ```

-   **`GET /feedback/:id`**
    -   **Purpose**: Retrieves a single feedback entry by its ID.
    -   **Permissions**: Requires `JwtAuthGuard` and `PermissionsGuard` with `feedback:0` permission.
    -   **Path Parameters**: `id` (string, converted to number).
    -   **Response**: Returns a single feedback object. Throws `NotFoundException` if the ID does not exist.
    -   **Code**:
        ```typescript
        @UseGuards(JwtAuthGuard, PermissionsGuard)
        @Get(':id')
        @HasPermission('feedback:0')
        findOne(@Param('id') id: string) {
          return this.feedbackService.findOne(+id);
        }
        ```

-   **`DELETE /feedback/:id`**
    -   **Purpose**: Deletes a feedback entry by its ID.
    -   **Permissions**: Requires `JwtAuthGuard` and `PermissionsGuard` with `feedback:2` permission.
    -   **Path Parameters**: `id` (string, converted to number).
    -   **Response**: Returns the deleted feedback object.
    -   **Code**:
        ```typescript
        @UseGuards(JwtAuthGuard, PermissionsGuard)
        @Delete(':id')
        @HasPermission('feedback:2')
        remove(@Param('id') id: string) {
          return this.feedbackService.delete(+id);
        }
        ```

### 3.2. Service Layer (`FeedbackService`)
The `FeedbackService` (`backend/src/app/feedback/feedback.service.ts`) handles the business logic and interaction with the database via Prisma.

-   **`create(dto: any)`**: Inserts a new feedback record into the database using `prisma.feedback.create`. It maps `dto.name`, `dto.email`, `dto.message`, and `dto.rating` to the corresponding Prisma model fields.
-   **`findAll()`**: Retrieves all feedback records using `prisma.feedback.findMany`, ordered by `createdAt` descending.
-   **`findOne(id: number)`**: Fetches a unique feedback record by its `id` using `prisma.feedback.findUnique`. Throws `NotFoundException` if no record is found.
-   **`delete(id: number)`**: Deletes a feedback record by its `id` using `prisma.feedback.delete`.

### 3.3. Module (`FeedbackModule`)
The `FeedbackModule` (implicitly defined by the controller and service) is responsible for organizing the feedback-related components. It likely imports `PrismaService` and sets up the controller and service for dependency injection within the NestJS application.

## 4. Frontend Implementation

### 4.1. Admin Page (`/admin/feedback`)
The admin feedback page (`client/app/admin/feedback/page.tsx`) displays a list of feedback entries.
-   **Data Fetching**: It uses an `useEffect` hook to call `loadFeedback` when an `accessToken` is available.
-   **State Management**: Feedback data is stored in a `feedback` state variable (`useState<Feedback[]>([])`).
-   **Rendering Logic**: The page iterates through the `feedback` array and displays each item. It uses fallback logic for fields like `title` and `description` (e.g., `item.title || item.name` and `item.description || item.message`) because these fields are not consistently provided by the backend, or are completely absent.
-   **Filtering**: The page implements filtering logic based on fields like `status`, `type`, and `priority`. However, `type` and `priority` are not available in the current backend API response, making these filters non-functional as implemented.

### 4.2. API Client (`feedbackApi`)
The `feedbackApi` (`client/src/entities/Feedback/api.ts`) is a client-side wrapper for interacting with the backend feedback API.
-   **`getFeedback(token: string | null): Promise<Feedback[]>`**: This asynchronous function makes a GET request to `${API_URL}/feedback`, including an authorization header if a token is provided. It expects an array of `Feedback` objects as a response.
-   Other methods like `create`, `update`, and `delete` are defined but, according to the context, are not currently used by the admin feedback page.

### 4.3. Read-Only State
As described in the user guide, the admin page (`/admin/feedback`) is currently read-only. It fetches and displays feedback but does not provide functionality for updating statuses, assigning feedback, or other write operations through the UI.

## 5. Security

### 5.1. Authentication
The `JwtAuthGuard` is applied to `GET` and `DELETE` endpoints in the `FeedbackController`. This ensures that only authenticated users (those with a valid JWT) can access these operations.

### 5.2. Authorization
The `PermissionsGuard` and `@HasPermission` decorator are used for granular access control:
-   `@HasPermission('feedback:0')`: Required for `GET /feedback` and `GET /feedback/:id`. This permission likely grants read access to feedback.
-   `@HasPermission('feedback:2')`: Required for `DELETE /feedback/:id`. This permission likely grants delete access.
The permissions structure (`feedback:0`, `feedback:2`) suggests a bitmask or hierarchical permission system where different numbers correspond to different levels of access (e.g., 0 for read, 1 for write/update, 2 for delete).

## 6. Potential Improvements

-   **Align Backend Model with Frontend Interface**: Update the `backend/prisma/schema.prisma` to include all fields present in the frontend `Feedback` interface (`title`, `description`, `type`, `priority`, `userId`, `assignedToId`, `resolvedAt`, `tags`, `attachments`). This would enable full functionality on the frontend and eliminate the need for fallback rendering logic. Consider creating separate `User` and `Assignment` models if `user` and `assignedTo` are to be relational.
-   **Implement Missing Write Operations**: Extend the `FeedbackController` and `FeedbackService` to support updating feedback entries, such as changing their `status`, `priority`, or assigning them to a user. This would involve adding `PUT` or `PATCH` endpoints.
-   **Enhance Admin Panel Functionality**: Implement UI elements in `client/app/admin/feedback/page.tsx` for write operations (e.g., buttons to change status, assign feedback, add comments, manage attachments), leveraging the newly available backend endpoints.
-   **Standardize Field Names**: Ensure consistent naming conventions across frontend and backend (e.g., `message` vs. `description`, `name` vs. `title`).
-   **Add Validation**: Implement DTOs (Data Transfer Objects) for `create` and `update` operations on the backend to ensure data integrity and proper validation.
-   **Implement Search and Pagination**: For a large number of feedback entries, add search, filtering (with proper backend support for fields like `type` and `priority`), and pagination to the `findAll` endpoint to improve performance and usability.
-   **Detailed User Information**: If `userId` is added to the backend, `GET` endpoints could optionally include related `User` data using Prisma's `include` functionality.