# Technical Specification: Blog Module

## 1. Overview

The Blog module is an implementation of the application's standard content entity pattern, providing a robust Content Management System (CMS) for creating, publishing, and managing blog posts. It allows users to draft, edit, and publish blog posts, categorize them, attach media, and manage SEO metadata.

Architecturally, the Blog module is nearly identical to the `Articles` module, sharing common design patterns for both its backend API and frontend user interface. This consistency ensures maintainability, predictable behavior, and efficient development.

## 2. Data Model (`BlogPost` in `prisma.schema.prisma`)

The `BlogPost` data model defines the structure for all blog posts within the application. It is stored in the `prisma.schema.prisma` file and closely mirrors the `Article` model to maintain consistency across content types.

```prisma
model BlogPost {
  id          Int       @id @default(autoincrement())
  title       String
  slug        String    @unique
  content     String
  excerpt     String?
  status      String    @default("draft")
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  publishedAt DateTime?

  author   User? @relation("UserBlogPosts", fields: [authorId], references: [id])
  authorId Int?

  template String @default("default")

  featuredImage   MediaFile? @relation("FeaturedImageOfBlogPost", fields: [featuredImageId], references: [id])
  featuredImageId Int?

  seoTitle       String?
  seoDescription String?
  metaKeywords   String[]   @default([])

  featuredSlider   Slider? @relation("FeaturedSliderOfBlogPost", fields: [featuredSliderId], references: [id])
  featuredSliderId Int?

  contentBlocks Json? @default("[]")
  comments      Comment[]
  categories    Category[] @relation("BlogPostCategories")
  analyticsEntries AnalyticsEntry[] @relation("BlogPostAnalytics")
  paymentMethod   PaymentMethod? @relation("BlogPostPaymentMethod", fields: [paymentMethodId], references: [id])
  paymentMethodId Int?
  enableFeedback  Boolean        @default(true)
}
```

Key aspects of the `BlogPost` model:
*   **`excerpt` field**: The model explicitly includes an `excerpt` field for a short summary of the blog post, which is crucial for listings and SEO.
*   **No Parent-Child Hierarchy**: Unlike some other content types (e.g., `Page`), the `BlogPost` model does not support a parent-child hierarchical structure. Blog posts are treated as standalone entities.
*   **Relations**: The `BlogPost` model includes relations to `User` (author), `Category` for classification, `Comment` for user interaction, `MediaFile` for featured images, `Slider` for embedded sliders, and `PaymentMethod` for monetization or gated content. It also includes `AnalyticsEntry` for tracking views.

## 3. Backend Implementation (`BlogService`, `BlogController`)

The backend implementation for the Blog module strictly adheres to the standard architectural patterns established within the application, mirroring the `Articles` module's structure and functionality.

**Summary:**
*   **`BlogController`**: Handles administrative CRUD (Create, Read, Update, Delete) operations for blog posts.
*   **`PublicBlogController`**: Provides endpoints for public access to published blog posts.
*   **`BlogService`**: Encapsulates the core business logic, data validation, and interaction with the Prisma ORM for the `BlogPost` model.

**Features:**
*   **RESTful Endpoints**: The module exposes a comprehensive set of RESTful API endpoints for managing blog posts, including operations for listing, retrieving, creating, updating, and deleting.
*   **`/draft` Endpoint**: A dedicated endpoint exists to manage blog post drafts, allowing authors to save work in progress without making it publicly accessible.
*   **Redis Caching**: Queries for public blog posts are optimized with Redis caching to improve performance and reduce database load, following the application's standard caching strategy.
*   **`generateUniqueSlug` Utility**: A utility function ensures that all blog posts have unique, SEO-friendly slugs, automatically generating them from the title and preventing conflicts.

**Key Omission:**
Consistent with the `Articles` module, the Blog module **does not** include an `/ai/complete` endpoint or any AI-assisted writing features in its backend implementation. All content generation and enhancement are manual.

## 4. Frontend Implementation (`CreateBlogPostPage` / `EditBlogPostPage`)

The frontend interface for managing blog posts is designed as a stateful React component, following the established UI/UX patterns of the application, particularly those seen in the `Articles` module.

**Summary:**
*   The UI for creating and editing blog posts is a stateful React component.
*   It features the standard two-column layout for content editing and settings management.
*   The main content area utilizes the shared `DescriptionFieldWrapper` component, which integrates a rich block editor for content creation.

**UI Features:**
*   **Dedicated `excerpt` field**: A distinct input field is provided for authors to write a concise `excerpt` for each blog post, separate from the main content.
*   **Settings for Supported Features**: The UI includes comprehensive settings panels for all features supported by the `BlogPost` model, such as:
    *   Category selection.
    *   Featured content toggles (e.g., for homepage display).
    *   SEO metadata inputs (title, description, keywords).
    *   Featured image and slider selection.
    *   Payment method association.
    *   Feedback enablement.
*   **No AI Assistance or Hierarchical Page Management UI**: In line with the backend, the frontend UI explicitly **does not** provide any features for AI-assisted writing or hierarchical page management. The design focuses purely on manual content creation and management within a flat structure.