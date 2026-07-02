# Sliders Module Technical Specification

## 1. Overview

The Sliders module provides a robust system for managing dynamic content carousels, often used for featured content, advertisements, or image galleries. It features a sophisticated backend with separate administrative and public APIs, extensive Redis caching for performance, and a rich frontend interface for managing complex nested data structures (sliders and their individual slides). The module is designed to be highly configurable and scalable, allowing for the creation and display of various types of sliders across the application.

## 2. Data Model

The data model for the Sliders module is relational, leveraging `Prisma` for database interactions. It consists primarily of two main models: `Slider` and `Slide`.

### 2.1. `Slider` Model

The `Slider` model represents a collection of slides. Each slider is uniquely identified and contains metadata.

```prisma
model Slider {
  id          Int      @id @default(autoincrement())
  name        String   @unique     // Unique name for the slider (e.g., "Homepage Hero")
  slug        String   @unique     // Unique URL-friendly identifier for the slider
  description String?              // Optional description of the slider's purpose
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  slides      Slide[]              // Relation to associated Slide records
}
```

### 2.2. `Slide` Model

The `Slide` model represents an individual item within a `Slider`. Each slide can have its own content, linking capabilities, and an associated image.

```prisma
model Slide {
  id          Int      @id @default(autoincrement())
  title       String?              // Optional title for the slide
  description String?              // Optional descriptive text for the slide
  linkUrl     String?              // Optional URL the slide links to
  sortOrder   Int      @default(0) // Order in which the slide appears within its slider
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  image       MediaFile? @relation(fields: [imageId], references: [id]) // Relation to a MediaFile
  imageId     Int?                                                        // Foreign key for the MediaFile

  slider      Slider? @relation(fields: [sliderId], references: [id])   // Relation to its parent Slider
  sliderId    Int?                                                        // Foreign key for the Slider
}
```

### 2.3. Relationships

The Sliders module defines the following key relationships:

-   **`Slider` to `Slide` (One-to-Many):** A `Slider` can contain multiple `Slide` records. The `sliderId` in the `Slide` model establishes this relationship, linking each slide back to its parent slider.
-   **`Slide` to `MediaFile` (One-to-One):** Each `Slide` can optionally be associated with a single `MediaFile` (e.g., an image). The `imageId` in the `Slide` model serves as a foreign key to the `MediaFile` model.

## 3. Backend Implementation

The backend is built with `NestJS` and utilizes `Prisma` for database access and `Redis` for caching. It provides distinct API endpoints for administrative tasks and public consumption.

### 3.1. Admin API (`SlidersController`)

The `SlidersController` handles full CRUD (Create, Read, Update, Delete) operations for `Slider` and `Slide` entities. It is protected by authentication and authorization guards.

-   **Base Path:** `/sliders`

| Endpoint                      | HTTP Method | Description                                  | Permissions Required |
| :---------------------------- | :---------- | :------------------------------------------- | :------------------- |
| `/`                           | `POST`      | Create a new `Slider`.                       | `sliders:2`          |
| `/`                           | `GET`       | Retrieve all `Slider` records.               | `sliders:0`          |
| `/:id`                        | `GET`       | Retrieve a single `Slider` by its ID.        | `sliders:0`          |
| `/:id`                        | `PATCH`     | Update an existing `Slider` by its ID.       | `sliders:1`          |
| `/:id`                        | `DELETE`    | Delete a `Slider` by its ID.                 | `sliders:2`          |
| `/:sliderId/slides`           | `POST`      | Create a new `Slide` for a specified `Slider`. | `sliders:2`          |
| `/:sliderId/slides`           | `GET`       | Retrieve all `Slide` records for a `Slider`. | `sliders:0`          |
| `/:sliderId/slides/:slideId`  | `GET`       | Retrieve a specific `Slide` within a `Slider`. | `sliders:0`          |
| `/:sliderId/slides/:slideId`  | `PATCH`     | Update a specific `Slide` within a `Slider`. | `sliders:1`          |
| `/:sliderId/slides/:slideId`  | `DELETE`    | Delete a specific `Slide` from a `Slider`.   | `sliders:2`          |

### 3.2. Public API (`PublicSlidersController`)

The `PublicSlidersController` provides read-only access to slider data, optimized for public-facing components. It exposes methods to fetch sliders by ID or by their unique slug.

-   **Base Path:** `/public/sliders`

| Endpoint    | HTTP Method | Description                          |
| :---------- | :---------- | :----------------------------------- |
| `slug/:slug`| `GET`       | Retrieve a `Slider` by its unique slug.|
| `/:id`      | `GET`       | Retrieve a `Slider` by its ID.       |

### 3.3. Service Layer (`SlidersService`)

The `SlidersService` acts as the central business logic unit for the Sliders module. It orchestrates data access, caching, and complex data retrieval.

-   **Role:**
    -   Encapsulates all logic related to `Slider` and `Slide` management.
    -   Interacts directly with `PrismaService` for database operations.
    -   Manages caching using Redis to improve read performance.
-   **Redis Caching Strategy:**
    -   **Keys:** Cache keys are generated based on the entity type (e.g., `slider:id:123`, `slider:slug:homepage-hero`).
    -   **TTL (Time-To-Live):** Configurable TTLs are applied to cached entries to ensure data freshness.
    -   **Invalidation:**
        -   Any `create`, `update`, or `remove` operation on a `Slider` or `Slide` entity triggers the invalidation of relevant cached entries (e.g., deleting a slider invalidates its specific `id` and `slug` cache entries, as well as any cached lists of sliders).
        -   This "write-through" or "write-behind" caching strategy ensures that public-facing data is always up-to-date.
-   **Relational Data Handling:**
    -   The `SlidersService` utilizes Prisma's `include` statements to eagerly load related `Slide` and `MediaFile` data when fetching a `Slider`. For example, `findOneSlider` includes `slides` (ordered by `sortOrder`) and each `slide` includes its `image`. This minimizes the number of database queries required to retrieve a complete slider object.
    -   When creating or updating a `Slide`, the service handles connecting the slide to its parent `Slider` via `sliderId` and its associated `MediaFile` via `imageId`.

## 4. Frontend Implementation

The frontend for the Sliders module is managed within the `client` application, focusing on the administrative interface for slider management.

### 4.1. Sliders List (`/admin/sliders`)

This page provides an overview of all existing sliders, allowing administrators to view, search, and navigate to individual slider editing pages. It typically displays a table or list of sliders with basic information and actions (edit, delete).

### 4.2. Slider Editor (`/admin/sliders/edit/[id]`)

This is the primary interface for managing a specific slider and its nested slides.

-   **State Management:**
    -   The `EditSliderPage` component uses React's `useState` and `useEffect` hooks to manage the `slider` object and an array of `slides`.
    -   Upon loading, `useEffect` fetches the slider data (including its slides) from the backend using the provided `id` and `accessToken`.
-   **Dynamic Slide Management:**
    -   **Add Slide:** The `handleAddSlide` function creates a new, empty slide object and adds it to the `slides` state array, allowing the user to configure new slides dynamically.
    -   **Remove Slide:** The `handleRemoveSlide` function filters the `slides` state array, removing the specified slide.
    -   The UI dynamically renders form inputs for each slide in the `slides` array, enabling individual editing of slide properties (title, description, linkUrl, sortOrder).
-   **MediaPickerModal Integration:**
    -   The `handleMediaSelect` function is triggered when a user wants to associate an image with a slide.
    -   It opens a `MediaPickerModal`, allowing the user to select an existing `MediaFile` or upload a new one.
    -   A callback mechanism updates the `imageId` for the specific slide in the `slides` state array once an image is selected from the modal.
-   **Save Functionality:**
    -   The `handleSave` asynchronous function gathers the current `slider` and `slides` state data.
    -   It then sends this consolidated data to the backend's `updateSlider` endpoint (or similar) to persist the changes.

## 5. Security

Security for the Sliders module is enforced at the backend API level using a combination of JWT authentication and role-based access control (RBAC) permissions.

-   **`@ApiBearerAuth()`:** Indicates that endpoints require a JWT bearer token for authentication.
-   **`JwtAuthGuard`:** Ensures that incoming requests have a valid JWT token. If the token is invalid or missing, the request is rejected.
-   **`PermissionsGuard`:** Authorizes requests based on assigned user permissions. It checks if the authenticated user has the necessary permissions to access a specific endpoint or perform a particular action.
-   **Permissions:**
    -   `sliders:0`: Read-only access to sliders and slides (e.g., view all, view specific).
    -   `sliders:1`: Write access for updating existing sliders and slides (e.g., edit, reorder).
    -   `sliders:2`: Full administrative access, including creation and deletion of sliders and slides.
