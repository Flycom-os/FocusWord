# Media Files Module: Technical Specification

## 1. Overview

This document outlines the technical implementation of the Media Files module, a feature designed for managing digital assets within the application. The architecture consists of a NestJS-based backend responsible for handling file uploads, storage, and data persistence, and a React-based frontend providing a user interface for administration.

The backend leverages a PostgreSQL database via Prisma for metadata storage, Redis for caching to enhance performance, and a permission-based security model to control access. The frontend provides a responsive and efficient user experience with features like asynchronous uploads, debounced search, and dynamic filtering.

## 2. Data Model (`MediaFile`)

The core of the module is the `MediaFile` data model, defined in the `prisma/schema.prisma` file. This model represents the metadata for each uploaded file.

```prisma
model MediaFile {
  id         Int      @id @default(autoincrement())
  filename   String
  filepath   String   @unique
  mimetype   String
  fileSize   Int
  altText    String?
  caption    String?
  uploadedAt DateTime @default(now())
  updatedAt  DateTime @updatedAt

  uploadedBy   User? @relation(fields: [uploadedById], references: [id])
  uploadedById Int?

  isImage Boolean @default(false)
  isVideo Boolean @default(false)
  isAudio Boolean @default(false)

  thumbnailUrl String?
  duration     Int? // In seconds for audio/video
  width        Int? // In pixels for images
  height       Int? // In pixels for images
}
```

**Field Descriptions:**

- `id`: Unique identifier for the media file record.
- `filename`: The original name of the uploaded file.
- `filepath`: The unique path on the server where the file is stored.
- `mimetype`: The MIME type of the file (e.g., `image/png`, `video/mp4`).
- `fileSize`: The size of the file in bytes.
- `altText`: Alternative text for accessibility, primarily for images.
- `caption`: A user-defined caption for the file.
- `uploadedAt` / `updatedAt`: Timestamps for record creation and updates.
- `uploadedById`: A foreign key linking to the `User` who uploaded the file.
- `isImage` / `isVideo` / `isAudio`: Booleans to quickly filter by media type.
- `thumbnailUrl`: A URL to a generated thumbnail, if applicable.
- `duration`: The duration of an audio or video file in seconds.
- `width` / `height`: The dimensions of an image in pixels.

## 3. Backend Implementation

The backend is built with NestJS and handles all business logic related to media file management.

### 3.1. API Endpoints

All media-related endpoints are consolidated under the `/mediafiles` route and secured using `JwtAuthGuard` and a custom `PermissionsGuard`.

- **`POST /mediafiles/upload`**
  - **Function:** Uploads a new file.
  - **Security:** Requires `media-files:2` (Create) permission.
  - **Payload:** `multipart/form-data` with a `file` field and optional DTO fields (`altText`, `caption`).
  - **Response:** The newly created `MediaFile` object.

- **`GET /mediafiles/file/:filename`**
  - **Function:** Serves a static file directly.
  - **Security:** Public. No authentication required. This allows files to be easily embedded in public-facing content.
  - **Response:** The raw file (e.g., an image or video).

- **`GET /mediafiles`**
  - **Function:** Retrieves a paginated and filtered list of media files.
  - **Security:** Requires `media-files:0` (Read) permission.
  - **Query Params:** Supports pagination (`page`, `limit`), sorting, and filtering (e.g., `search`, `isImage`).
  - **Response:** A `PaginatedMediaFiles` object containing the data array and total count.

- **`GET /mediafiles/:id`**
  - **Function:** Retrieves metadata for a single media file.
  - **Security:** Requires `media-files:0` (Read) permission.
  - **Response:** A single `MediaFile` object.

- **`PATCH /mediafiles/:id`**
  - **Function:** Updates the metadata of a media file (e.g., `altText`, `caption`).
  - **Security:** Requires `media-files:1` (Update) permission.
  - **Payload:** `UpdateMediaFileDto` with fields to be updated.
  - **Response:** The updated `MediaFile` object.

- **`DELETE /mediafiles/:id`**
  - **Function:** Deletes a media file record from the database and the corresponding physical file from the disk.
  - **Security:** Requires `media-files:2` (Delete) permission.
  - **Response:** The `MediaFile` object that was deleted.

### 3.2. File Handling

- **Uploads:** File uploads are handled using the `multer` library, configured via `FileInterceptor`. Files are saved to the `backend/uploads/` directory with a unique, randomly generated name to prevent naming conflicts.
- **Storage:** The physical files are stored on the server's local filesystem. The `filepath` in the database points to this location.
- **Serving:** Files are served publicly via the `GET /mediafiles/file/:filename` endpoint, which uses `res.sendFile` to stream the file from the disk.

### 3.3. Service Layer (`MediafilesService`)

The `MediafilesService` contains the core business logic.

- **Role:** It acts as an abstraction layer between the `MediafilesController` and the database (Prisma) and cache (Redis). It is responsible for all data manipulation and retrieval logic.
- **Caching:**
  - **Strategy:** A cache-aside strategy is implemented for `findAll` queries. Results of list queries are cached in Redis to reduce database load and improve response times for repeated requests.
  - **Key Structure:** Cache keys are generated based on the JSON representation of the query parameters (e.g., `mediafiles_{"page":1,"limit":20,"isImage":true}`). This ensures that each unique filter/pagination combination is cached separately.
  - **Expiration:** Cached data is set to expire after one hour (`3600` seconds) to ensure eventual consistency.
  - **Invalidation:** The cache is invalidated upon any create, update, or delete operation. Specifically:
    - On `create` and `remove`, all list caches (`mediafiles_*`) are invalidated to ensure lists reflect the changes.
    - On `update` and `remove`, the specific item cache (`mediafile_{id}`) is also deleted.
- **Physical File Deletion:** The `remove` method ensures data integrity by first locating the `MediaFile` record, then using the `filepath` to construct the absolute path to the physical file on disk. It uses Node.js's `fs.promises.unlink` to delete the file before deleting the corresponding record from the database. This process is wrapped in a `try...catch` block to prevent application crashes if the file is unexpectedly missing.

### 3.4. DTOs

Data Transfer Objects (DTOs) are used extensively for:
- **Validation:** `class-validator` decorators on DTOs ensure that incoming request bodies and query parameters are well-formed.
- **Type Safety:** DTOs provide strong typing for request payloads and service method arguments.

## 4. Frontend Implementation

The frontend is a React-based single-page application that provides a rich interface for managing media files.

### 4.1. Admin View (`media-files-admin-view.tsx`)

This is the main component for viewing and managing media files.

- **State Management:**
  - Local component state is managed with `useState` hooks to track the list of `mediaFiles`, current `filters` (search term, media type), and `pagination` settings.
  - The `useEffect` hook is used to trigger data fetching whenever the `query` object (derived from filters and pagination) or the user's `accessToken` changes.
- **Data Fetching:**
  - API calls are made to the backend to fetch the list of media files. The `query` state is serialized into URL search parameters for the `GET /mediafiles` request.
  - Actions like deletion and metadata updates are handled by calling the corresponding API client functions.
- **Debounced Search:** To prevent excessive API calls while the user is typing in the search box, a `useDebounce` hook is applied to the search filter. This delays the API request until the user has stopped typing for 500ms, improving performance and user experience.

### 4.2. API Client

A dedicated API client layer (e.g., a set of functions like `fetchMediaFiles`, `uploadMediaFile`, `deleteMediaFile`) abstracts the `fetch` API or a library like `axios`. This layer is responsible for:
- Attaching the JWT `accessToken` to the `Authorization` header for all secured requests.
- Handling request/response bodies and serialization.
- Centralizing API error handling.

## 5. Security

Security is a critical aspect of the Media Files module, ensuring that only authorized users can perform actions.

### 5.1. Authentication

All endpoints (except the public file serving route) are protected by the `JwtAuthGuard`. This guard validates the JSON Web Token (JWT) sent in the `Authorization` header of each request, ensuring the user is logged in.

### 5.2. Authorization

Role-based access control (RBAC) is implemented using a custom `PermissionsGuard` and `HasPermission` decorator. This allows for granular control over what actions a user can perform based on their assigned permissions.

- **`media-files:0` (Read):** Allows viewing the list of media files and their individual details.
- **`media-files:1` (Update):** Allows editing the metadata of existing files.
- **`media-files:2` (Create/Delete):** Allows uploading new files and deleting existing ones.

### 5.3. Public Access

The `GET /mediafiles/file/:filename` endpoint is intentionally left public to allow for the seamless embedding of assets (like images in articles or user avatars) across the application without requiring authentication for every resource request.
