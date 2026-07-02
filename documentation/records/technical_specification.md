# Technical Specification: Records Module

This document provides a detailed technical specification for the "Records" module and its "Record Categories" sub-module, outlining their architecture, data models, and implementation details across both backend and frontend components.

---

## Part 1: Core Records Module

### 1. Overview

The "Records" module serves as a robust content management system, enabling the creation and management of various content types referred to as "Records." It incorporates a rich block-based content editor, AI-assisted writing capabilities, and seamless integration with other modules such, as Media Files for image and file management, and Sliders for dynamic content display.

The backend infrastructure is built using NestJS, leveraging Prisma for ORM capabilities and Redis for an efficient caching layer, ensuring a performant and scalable API. The frontend is a sophisticated React application, offering a highly interactive user experience with advanced content editing functionalities.

### 2. Data Model (`Record`)

The `Record` data model is defined in `prisma/schema.prisma` and represents the core entity of this module. It is designed to be flexible, accommodating various content structures and relationships.

```prisma
model Record {
  id              Int        @id @default(autoincrement())
  title           String
  slug            String     @unique
  content         String     // Note: Can be a markdown/HTML representation of blocks
  status          String     @default("draft") // 'draft' or 'published'
  template        String     @default("default")
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt
  publishedAt     DateTime?

  author          User?      @relation(fields: [authorId], references: [id])
  authorId        Int?

  categories      Category[] @relation("RecordCategories")

  featuredImage   MediaFile? @relation("FeaturedImageOfRecord", fields: [featuredImageId], references: [id])
  featuredImageId Int?

  featuredSlider  Slider?    @relation("FeaturedSliderOfRecord", fields: [featuredSliderId], references: [id])
  featuredSliderId Int?

  // Stores the block-editor structure (e.g., from Editor.js)
  contentBlocks   Json?      @default("[]")

  seoTitle        String?
  seoDescription  String?
  metaKeywords    String[]   @default([])
  // ... other relations
}
```

**Key Fields and Relations:**

*   **`id`**: Unique identifier for each record.
*   **`title`**: The main title of the record.
*   **`slug`**: A unique, URL-friendly identifier generated from the title, crucial for SEO and permalinks.
*   **`content`**: Stores the processed content of the record, potentially as Markdown or HTML generated from the block editor. This field is a fallback or rendered representation of `contentBlocks`.
*   **`status`**: Defines the publication state of the record, e.g., `'draft'` or `'published'`.
*   **`template`**: Specifies which frontend template should be used to render the record.
*   **`createdAt`**, **`updatedAt`**, **`publishedAt`**: Timestamps for tracking creation, last update, and publication dates.
*   **`author`** (Relation): Links the record to a `User` who authored it, via `authorId`.
*   **`categories`** (Relation): A many-to-many relationship with the `Category` module, allowing records to be classified under multiple categories.
*   **`featuredImage`** (Relation): Connects the record to a `MediaFile` entity (e.g., a thumbnail), via `featuredImageId`.
*   **`featuredSlider`** (Relation): Links the record to a `Slider` entity for displaying dynamic content blocks, via `featuredSliderId`.
*   **`contentBlocks`**: This `Json` type field is critical. It stores the structured data representing the block-editor's output (e.g., from Editor.js). This allows for a flexible and rich content structure beyond simple Markdown/HTML, enabling the frontend editor to reconstruct the content visually. The default value `[]` ensures it's always a valid JSON array.
*   **`seoTitle`**, **`seoDescription`**, **`metaKeywords`**: Fields dedicated to search engine optimization.

### 3. Backend Implementation (`records.service.ts`, `records.controller.ts`)

The backend for the Records module is implemented using NestJS, providing a structured and modular API.

#### `RecordsController`

The `RecordsController` (`src/app/records/records.controller.ts`) exposes a set of RESTful API endpoints for managing records. All endpoints are secured using `JwtAuthGuard` for authentication and `PermissionsGuard` for authorization, ensuring that only authenticated and authorized users can interact with the module.

*   **`POST /`**: Creates a new record based on the provided payload.
*   **`POST /draft`**: Creates a new record with default values and automatically generates a unique slug. This is typically used for quickly initiating a new record without all details.
*   **`POST /ai/complete`**: An endpoint dedicated to AI content generation. It accepts a request to generate or complete content using an integrated AI service.
*   **`GET /`**: Retrieves a paginated and filtered list of records. This endpoint supports query parameters for searching, filtering, and pagination.
*   **`GET /:id`**: Retrieves a single record by its numeric `id`.
*   **`GET /slug/:slug`**: Retrieves a single record by its unique `slug`. This is often used for public-facing content retrieval.
*   **`PUT /:id`**: Updates an existing record identified by `id` with the provided data.
*   **`DELETE /:id`**: Deletes a record specified by `id`.
*   **`PATCH /:id/status`**: Updates only the `status` field of a record.

#### `RecordsService`

The `RecordsService` (`src/app/records/records.service.ts`) encapsulates the business logic for record management, interacting with the database via Prisma and managing caching.

*   **AI Integration (`completeWithAi`)**:
    *   This method is responsible for integrating with an external AI service for content generation.
    *   It retrieves the `DEEPSEEK_API_KEY` from environment variables or configuration.
    *   It constructs a prompt for the AI, including both system-level instructions and user-specific messages, to guide the content generation.
    *   A `POST` request is sent to the DeepSeek API endpoint with the constructed prompt.
    *   The method is designed to handle both successful responses from the AI service (returning the generated content) and error conditions, providing appropriate feedback.

*   **Slug Generation (`generateUniqueSlug`)**:
    *   This utility method takes a `title` as input and generates a URL-friendly `slug`.
    *   It typically involves lowercasing, replacing spaces with hyphens, and removing special characters.
    *   To ensure uniqueness, it queries the database to check for existing slugs. If a duplicate is found, it appends an incremental number (e.g., `my-record`, `my-record-1`, `my-record-2`) until a unique slug is generated.

*   **Caching Strategy (Redis)**:
    *   The service employs Redis as a caching layer to improve the performance of read operations.
    *   **`findAll`** and **`findOneBySlug`** methods first attempt to retrieve data from Redis using specific cache keys (e.g., `records_list_page_1_filter_x`, `record_slug_my-record`).
    *   If a cache hit occurs, the cached data is returned directly.
    *   In case of a cache miss, the data is fetched from the Prisma ORM (database), and then stored in Redis with an expiration time (e.g., `EX`, 3600 seconds for 1 hour) before being returned.
    *   **`invalidateCache`**: This crucial method is invoked on all write operations (`create`, `update`, `delete`). Its purpose is to clear relevant cache keys (e.g., `records_*`, `record_slug_*`) to ensure data consistency and prevent stale data from being served from the cache after modifications.

*   **Data Handling (Prisma Relations)**:
    *   The `create` and `update` methods meticulously handle incoming Data Transfer Objects (DTOs).
    *   When establishing relations with other entities like `Category`, `MediaFile`, and `Slider`, Prisma's `connect` or `set` syntax is utilized. This allows for efficient linking or unlinking of records with related entities, maintaining referential integrity within the database.

### 4. Frontend Implementation (`CreateRecordPage`, `EditRecordPage`)

The frontend for the Records module consists of complex, stateful React components, primarily `CreateRecordPage` and `EditRecordPage`, designed to provide a rich content authoring experience.

*   **Component Architecture**:
    *   These pages are significant, stateful React components. They are responsible for orchestrating a large form, integrating a block-based editor, and managing various UI interactions.
    *   They act as container components, managing data flow and interactions with sub-components (like the block editor itself, or modal triggers).

*   **State Management**:
    *   **`useState`**: Extensively used to manage the component's internal state, including:
        *   `form`: Holds the data for various record fields (title, slug, status, etc.).
        *   `editorData`: Manages the state and content of the block-based editor.
        *   Various UI states: `loading` indicators, `modal` visibility, form validation errors, etc.
    *   **`useEffect`**: Crucial for side effects, particularly on `EditRecordPage`. It is used to fetch and load initial record data when the component mounts or when the record ID changes, populating the form and editor with existing content.

*   **Block-Based Editor**:
    *   The module integrates a block-based editor (likely Editor.js or a similar library) for rich content creation.
    *   **`editorData`**: The editor's content is maintained in `editorData` state, structured in a format compatible with the chosen editor library (e.g., `OutputData` for Editor.js). This JSON structure represents the individual blocks (paragraphs, images, headings, etc.) of the content.
    *   **`DescriptionFieldWrapper`**: A wrapper component is likely used to encapsulate the editor's UI and logic, providing a standardized interface for its integration within the larger form.
    *   **Content Conversion Logic**: Helper functions are employed to manage the conversion between different content representations:
        *   `blocksFromRecord`: Converts raw record data (e.g., from `contentBlocks` JSON) into a format suitable for the editor instance.
        *   `serializeRecordBlocks`: Serializes the editor's output (block data) back into a format suitable for storage in the `contentBlocks` field of the `Record` model.
        *   `blocksToMarkdown`: Converts the editor's block data into Markdown format, potentially for the `content` field or for other uses.
        *   `markdownToBlocks`: Converts Markdown content back into the editor's block data structure. This layer of abstraction ensures flexibility and decouples the editor library's internal format from the application's storage format.

*   **Modal Integrations & Custom Events**:
    *   **Media Picker Integration**:
        *   To allow users to insert media (images, videos), the component dispatches a custom window event, typically named `open-media-picker`.
        *   An event listener is set up within the `CreateRecordPage`/`EditRecordPage` to detect this custom event.
        *   Upon detection, the `MediaPickerModal` component is dynamically opened.
        *   A callback function is passed to the `MediaPickerModal` to handle the selected media file, allowing the editor to incorporate the chosen media. This pattern promotes decoupling, as the editor doesn't directly import or control the media picker.
    *   **Slider Selection**:
        *   A similar decoupled pattern is observed for selecting sliders. Instead of directly importing a React component for the modal, the frontend constructs a modal dynamically using HTML strings.
        *   JavaScript functions are attached directly to the `window` object. These functions act as bridges, allowing the dynamically generated HTML modal to interact with the React component's state or dispatch events, enabling the selection of a slider and its integration into the record.

---

## Part 2: Record Categories Sub-Module

### 1. Overview

The "Record Categories" sub-module provides a straightforward, standard Create, Read, Update, Delete (CRUD) interface for managing categories. These categories are fundamental for classifying and organizing records within the primary Records module, facilitating content navigation and filtering.

### 2. Data Model (`Category`)

The `Category` data model, defined in `prisma/schema.prisma`, is designed to support a hierarchical structure for organizing content.

```prisma
model Category {
  id               Int        @id @default(autoincrement())
  name             String     @unique
  slug             String     @unique
  description      String?
  // ... relations to Record, Post, etc.

  // For self-referencing hierarchy
  parentCategory   Category?  @relation("CategoryHierarchy", fields: [parentCategoryId], references: [id])
  parentCategoryId Int?
  childCategories  Category[] @relation("CategoryHierarchy")
}
```

**Key Fields and Relations:**

*   **`id`**: Unique identifier for each category.
*   **`name`**: The display name of the category, enforced to be unique.
*   **`slug`**: A unique, URL-friendly identifier derived from the category `name`, used for clean URLs.
*   **`description`**: An optional field to provide more context about the category.
*   **`parentCategory`** (Relation): This is a **self-referencing relation** named `"CategoryHierarchy"`. It allows a category to point to another category as its parent, establishing a hierarchical structure.
*   **`parentCategoryId`**: The foreign key linking to the `id` of the parent category. A `null` value indicates a top-level category.
*   **`childCategories`** (Relation): The inverse of `parentCategory`, representing all categories that have the current category as their parent. This allows for easy traversal of the category tree.
*   **Other relations**: The comment `// ... relations to Record, Post, etc.` indicates that `Category` entities are related to other content types, such as `Record` (via the `"RecordCategories"` relation in the `Record` model), and potentially `Post` (if a separate blog module exists).

### 3. Backend Implementation (`record-categories.controller.ts`, `record-categories.service.ts`)

The backend for the Record Categories sub-module follows standard NestJS patterns for a CRUD API.

#### `RecordCategoriesController`

The `RecordCategoriesController` (`src/app/categories/record-categories.controller.ts`, inferred path) provides the standard RESTful endpoints for category management:

*   **`GET /`**: Retrieves a list of all categories. Supports pagination and filtering.
*   **`GET /:id`**: Retrieves a single category by its `id`.
*   **`POST /`**: Creates a new category.
*   **`PUT /:id`**: Updates an existing category identified by `id`.
*   **`DELETE /:id`**: Deletes a category specified by `id`.

#### `RecordCategoriesService`

The `RecordCategoriesService` (`src/app/categories/record-categories.service.ts`, inferred path) acts as a thin service layer, primarily orchestrating interactions with the database via Prisma.

*   It directly calls the corresponding Prisma methods to perform CRUD operations on the `Category` entity:
    *   `findMany()`: For retrieving multiple categories.
    *   `findUnique()`: For fetching a single category.
    *   `create()`: For adding new categories.
    *   `update()`: For modifying existing categories.
    *   `delete()`: For removing categories.
*   The service may include basic validation or business logic specific to categories, but its core function is to mediate between the controller and the data layer.

### 4. Frontend Implementation (`RecordCategoriesPage`)

The frontend component `RecordCategoriesPage` is responsible for presenting and managing the category data to the user.

*   **Component Architecture**:
    *   This is typically a single page component in a React application.
    *   It centralizes all logic and UI for displaying, creating, editing, and deleting categories.

*   **UI/UX**:
    *   **Display**: Categories are displayed in a visually organized manner, often as a card grid, which can include details like name, slug, description, and actions.
    *   **Pagination**: To handle a large number of categories, the UI incorporates pagination controls, allowing users to navigate through different sets of categories.
    *   **Modals for CRUD**: A modal dialog is used for both creating new categories and editing existing ones. This provides a focused and consistent user experience for data input.
        *   **`showCreateModal`**: A state variable that controls the visibility of the create/edit modal.
        *   **`editingCategory`**: A state variable that holds the data of the category currently being edited. If `null` or `undefined`, the modal is in "create" mode; otherwise, it's in "edit" mode, pre-filling the form with `editingCategory`'s data.

*   **State and API**:
    *   **`useState`**: Used extensively to manage the page's dynamic data and UI elements:
        *   List of categories currently displayed.
        *   Loading states (e.g., `isLoading`, `isSaving`).
        *   Pagination parameters (current page, total pages, items per page).
        *   Form data for the create/edit modal.
        *   Search terms for filtering categories.
    *   **`useEffect`**: Triggers side effects such as data fetching.
        *   It is used to call `loadCategories` whenever the component mounts, or when pagination parameters or search terms change, ensuring the displayed list is always up-to-date.
    *   **API Interaction**: The component interacts with the backend through an inferred `recordsApi` object (or a dedicated `categoriesApi` service). This object provides methods to:
        *   `getCategories()`: Fetch the list of categories from the backend.
        *   `createCategory()`: Send data to the backend to create a new category.
        *   `updateCategory()`: Send updated data for an existing category.
        *   `deleteCategory()`: Send a request to delete a category.
        This abstraction layer handles the actual HTTP requests and response parsing.