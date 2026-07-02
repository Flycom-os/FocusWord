# Technical Specification: Pages Module

## 1. Overview

The Pages module provides a comprehensive Content Management System (CMS) for creating and managing hierarchical, block-based content entities within the application. These "Pages" serve as flexible content containers, enabling dynamic and structured presentation of information.

**Architectural Note:** The backend and frontend architecture of the Pages module is almost identical to the "Records" module. It reuses established patterns for controllers, services, caching mechanisms, AI integration (via DeepSeek), and the rich text editor. This document will primarily focus on the unique features and data fields specific to Pages, while briefly acknowledging these shared architectural components.

## 2. Data Model (`Page` in `prisma.schema.prisma`)

The `Page` model shares many fundamental fields with the `Record` model, such as `title`, `slug`, `status`, `contentBlocks` (stored as JSON), and core relations to `User` (for authorship), `Category`, `MediaFile`, and `Slider`.

However, the `Page` model introduces key differences to support its unique capabilities:

*   **Hierarchy:** Pages can be nested, forming a parent-child structure. This is facilitated by a self-referencing relationship:

    ```prisma
    model Page {
      // ... other fields common with Record
      id          Int      @id @default(autoincrement())
      title       String
      slug        String   @unique
      status      String   @default("draft") // e.g., "draft", "published", "archived"
      contentBlocks Json?
      createdAt   DateTime @default(now())
      updatedAt   DateTime @updatedAt
      publishedAt DateTime?

      author      User?    @relation(fields: [authorId], references: [id])
      authorId    Int?

      categories  Category[]
      mediaFiles  MediaFile[]
      sliders     Slider[]

      parentPage    Page?    @relation("PageHierarchy", fields: [parentPageId], references: [id])
      parentPageId  Int?
      childPages    Page[]   @relation("PageHierarchy")
    }
    ```
    The `parentPage` and `childPages` fields define a recursive relationship, allowing any `Page` to have one parent and multiple children. The `parentPageId` field stores the ID of the parent page.

*   **Additional Relations & Fields:**

    ```prisma
    model Page {
      // ... hierarchy fields and other common fields
      paymentMethod   PaymentMethod? @relation("PagePaymentMethod", fields: [paymentMethodId], references: [id])
      paymentMethodId Int?
      enableFeedback  Boolean        @default(true)
    }
    ```
    *   `paymentMethodId`: This optional field establishes a relation to a `PaymentMethod` model (not detailed here), allowing a specific page to be associated with or require a particular payment provider or method.
    *   `enableFeedback`: A boolean flag that controls whether user comments or feedback mechanisms are enabled or disabled for that specific page. It defaults to `true`.

## 3. Backend Implementation (`PagesService`, `PagesController`)

### Summary of Similarities

The `PagesController` and `PublicPagesController` largely mirror their counterparts in the Records module. They provide a full suite of CRUD (Create, Read, Update, Delete) operations, a dedicated public endpoint for published pages, a `/draft` endpoint for previewing unpublished content, and an `/ai/complete` endpoint that leverages DeepSeek integration for content generation or enhancement.

Similarly, the `PagesService` reuses the robust infrastructure for Redis caching to optimize performance and the standardized slug generation logic to ensure unique and SEO-friendly URLs.

### Key Differences in `PagesService`

The core distinctions in the `PagesService` manifest in how it handles the unique fields and hierarchical nature of Pages during data manipulation:

*   **Hierarchy Management:**
    *   In the `create` and `update` methods, the service explicitly manages the `parentPageId` field. When a `parentPageId` is provided, the service utilizes Prisma's `connect` functionality to establish or modify the page's position within the content hierarchy. This ensures data integrity and proper relational linking.
*   **Additional Field Management:**
    *   The service also includes logic within its `create` and `update` operations to appropriately handle the `paymentMethodId` and `enableFeedback` fields, persisting their values to the database.
*   **Publishing Workflow:**
    *   The `PagesController` includes additional endpoints, `publish` and `unpublish`, which are specifically handled by the `PagesService`. These methods update the `status` field of a page (e.g., from "draft" to "published") and set or clear the `publishedAt` timestamp accordingly, managing the page's lifecycle and public visibility.

## 4. Frontend Implementation (`CreatePagePage` / `EditPagePage`)

### Summary of Similarities

The frontend components for creating and editing pages, `CreatePagePage` and `EditPagePage`, are rich, stateful React components. They adhere to the same established UI/UX patterns as the Records module, featuring a consistent two-column layout for content and settings. They also extensively reuse the `DescriptionFieldWrapper` component, which encapsulates the rich block editor functionality, and leverage the same custom event mechanism for the `MediaPickerModal` to handle media asset selection.

### Key UI/Feature Differences

The frontend introduces specific UI elements and functionalities to manage the unique aspects of the Pages module:

*   **Hierarchy Management (Parent Page Dropdown):**
    *   Within the settings sidebar of `CreatePagePage` and `EditPagePage`, a dedicated "Parent Page" dropdown is included. This UI element allows users to intuitively select an existing page to be the parent of the current page, thus defining its position in the content hierarchy.
*   **Widget Integration (`onWidgetSelect`):**
    *   The block editor, wrapped by `DescriptionFieldWrapper`, is significantly extended with an `onWidgetSelect` prop. This prop is tied to a new button within the editor interface. Clicking this button opens a modal that allows users to browse and select "Widgets." Widgets are reusable content blocks (managed by a separate module) that can be embedded directly into the `contentBlocks` of a page, providing powerful modular content capabilities unique to the Pages module.
*   **Additional Settings UI:**
    *   The settings sidebar also incorporates UI elements corresponding to the new data model fields:
        *   An "Enable Feedback" checkbox: This allows users to easily toggle the `enableFeedback` boolean flag, controlling whether user comments or feedback are permitted on the page.
        *   A "Payment Method" dropdown: This UI element enables users to associate a specific `paymentMethodId` with the page, linking it to a payment gateway or processing option.