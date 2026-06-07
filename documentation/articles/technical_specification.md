# Technical Specification: Articles Module

## 1. Overview
This module provides a CMS for "Articles," a content type geared towards chronological posts like news or blog entries.

**Architectural Note:** The Articles module is another implementation of the application's standard content entity pattern, sharing its core backend (NestJS, Prisma, Redis) and frontend (React rich-text editor) architecture with the `Pages` and `Records` modules. This specification will focus on the specific implementation details and differences.

## 2. Data Model (`Article` in `prisma.schema.prisma`)

The `Article` model's structure is defined as follows:

```prisma
model Article {
  id          Int       @id @default(autoincrement())
  title       String
  slug        String    @unique
  content     String
  excerpt     String?   // A key field for article summaries
  status      String    @default("draft")
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  publishedAt DateTime?

  // Standard relations
  author   User? @relation("UserArticles", fields: [authorId], references: [id])
  authorId Int?
  categories    Category[] @relation("ArticleCategories")
  comments      Comment[]
  
  // Content and Media relations
  template         String @default("default")
  featuredImage    MediaFile? @relation("FeaturedImageOfArticle", fields: [featuredImageId], references: [id])
  featuredImageId  Int?
  featuredSlider   Slider? @relation("FeaturedSliderOfArticle", fields: [featuredSliderId], references: [id])
  featuredSliderId Int?
  contentBlocks    Json? @default("[]")

  // Feature flags and extra relations
  paymentMethod   PaymentMethod? @relation("ArticlePaymentMethod", fields: [paymentMethodId], references: [id])
  paymentMethodId Int?
  enableFeedback  Boolean        @default(true)
  
  // SEO fields
  seoTitle       String?
  seoDescription String?
  metaKeywords   String[]   @default([])
  // ... other relations
}
```

**Key Differences from Other Models (`Page`, `Record`):**

*   **No Hierarchy:** Unlike the `Page` model, the `Article` model does not include a self-referencing relationship to establish parent-child hierarchies. Articles are designed to exist as flat, independent entities.
*   **Has Excerpt:** The `Article` model explicitly includes an `excerpt` field (`String?`) for storing a summary or brief introduction, which is not present in either the `Page` or `Record` models.
*   **Full-Featured:** The `Article` model consolidates features found in both `Pages` and `Records`. It includes `paymentMethod` and `enableFeedback` (like `Page`) and `categories` (like `Record`), making it a comprehensive content type.

## 3. Backend Implementation (`ArticlesService`, `ArticlesController`)

**Summary of Similarities:**
The `ArticlesController`, `PublicArticlesController`, and `ArticlesService` adhere to the established backend architectural pattern within the application. This includes:

*   **Standard RESTful CRUD Endpoints:** All typical Create, Read, Update, and Delete operations are exposed via RESTful endpoints.
*   **Authentication and Authorization:** Endpoints are protected by `JwtAuthGuard` for authentication and `PermissionsGuard` for fine-grained authorization, ensuring secure access.
*   **Draft Endpoint:** A dedicated `/draft` endpoint is provided for initializing new articles with sensible default values, streamlining content creation.
*   **Robust Service Layer:** The `ArticlesService` utilizes Redis for efficient caching and integrates a `generateUniqueSlug` utility to automatically create URL-friendly slugs based on article titles.

**Key Difference: No AI Integration:**
Crucially, the `ArticlesController` and `ArticlesService` **do not** feature any AI-assisted writing capabilities. This means:

*   There is **no `/ai/complete` endpoint** within the `ArticlesController`.
*   There is **no corresponding `completeWithAi` method** or similar AI integration logic within the `ArticlesService`.

## 4. Frontend Implementation (`CreateArticlePage` / `EditArticlePage`)

**Summary of Similarities:**
The frontend UI for creating and editing articles maintains consistency with other content modules:

*   **Stateful React Component:** The create/edit interface is implemented as a stateful React component.
*   **Two-Column Layout:** It utilizes the same familiar two-column layout observed in the `Pages` and `Records` editors, providing a consistent user experience.
*   **Shared Components:** The module reuses the `DescriptionFieldWrapper` component for its block-based rich-text editor, ensuring uniformity in content input. It also leverages the shared `MediaPickerModal` for selecting featured images and the `Slider` selection modal for associating content sliders.

**Key UI/Feature Differences:**

*   **Excerpt Field:** The UI includes a dedicated `textarea` input element specifically for the `excerpt` field, allowing content creators to easily define article summaries.
*   **Full Settings Suite:** The settings sidebar in the editor provides comprehensive UI controls for all supported relations and fields, including:
    *   Category selection.
    *   Featured Image assignment.
    *   Featured Slider integration.
    *   Payment Method configuration.
    *   A toggle for "Enable Feedback" (which controls comments).
*   **No AI Button:** In alignment with the backend's lack of AI integration, there is **no UI element** (e.g., a button or a dedicated section) in the editor to trigger an AI Content Helper or similar functionality.
*   **No Parent Selector:** Consistent with the `Article` data model's flat structure, the settings sidebar **does not include a "Parent Page" dropdown** or any other UI element for hierarchical relationships.