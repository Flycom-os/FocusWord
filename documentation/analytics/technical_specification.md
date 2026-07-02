# Technical Specification: "Analytics" Module

## 1. Architecture Overview

The "Analytics" module is a system for collecting and visualizing data on website traffic. The architecture consists of two main parts:

1.  **Backend (Nest.js)**: Acts as a data collector and statistics aggregator. It provides an API for recording events (page views) and retrieving processed data.
2.  **Frontend (Next.js/React)**: Implements the administrative dashboard for visualizing analytics. The dashboard requests data from the backend and presents it in the form of summary cards, charts, and tables.

**PostgreSQL** is used as the database with **Prisma** as the ORM. A Role-Based Access Control (RBAC) model on the backend protects access to analytics data.

## 2. Data Model (Database)

Data models are defined in `backend/prisma/schema.prisma`.

### 2.1. `AnalyticsEntry` Model

This is the main model that stores grouped view data for a specific piece of content (page, post, etc.) for a single day.

```prisma
model AnalyticsEntry {
  id            Int      @id @default(autoincrement())
  date          DateTime @db.Date
  totalViews    Int      @default(0)
  uniqueViews   Int      @default(0)
  bounceRate    Float?
  avgTimeOnPage Int?

  // Relationships with different content types
  pageId        Int?
  postId        Int?
  recordId      Int?
  blogPostId    Int?
  articleId     Int?
  
  referrers     ReferrerDetail[]
}
```

*   **Key Logic**: The system aims to maintain only **one record** for a `(date, content_id)` combination. If the same content is viewed again on the same day, a new record is not created; instead, the `totalViews` and `uniqueViews` counters of the existing record are incremented.

### 2.2. `ReferrerDetail` Model

Stores information about referral sources for a specific `AnalyticsEntry` record.

```prisma
model ReferrerDetail {
  id               Int    @id @default(autoincrement())
  referrerUrl      String
  count            Int    @default(0)
  analyticsEntryId Int?
}
```

## 3. Backend (API)

*   **Controller**: `backend/src/app/analytics/analytics.controller.ts`
*   **Service**: `backend/src/app/analytics/analytics.service.ts`
*   **Base Path**: `/analytics`

### 3.1. Key Endpoints

| Method | Path       | Description                               | Authentication / Permissions | DTO / Parameters                                   |
| :----- | :--------- | :---------------------------------------- | :--------------------------- | :------------------------------------------------- |
| `POST` | `/`        | Record a page view (idempotent)           | None                         | `CreateAnalyticsEntryDto`                          |
| `GET`  | `/stats`   | Get aggregated statistics                 | JWT, `analytics:0`           | Query: `startDate?`, `endDate?`                    |
| `GET`  | `/`        | Get a list of entries with filtering      | JWT, `analytics:0`           | `AnalyticsFilterDto`                               |
| `POST` | `/:id/referrers`| Add a referral source                 | None                         | Param: `id`, Body: `referrerUrl`                   |

### 3.2. Backend Logic

#### `create` (idempotent tracking)
The `analyticsService.create()` method implements the core data collection logic. When it receives a tracking request, it:
1.  Determines the uniqueness key: a combination of `date` and the content identifier (`pageId`, `postId`, etc.).
2.  Searches the database for an existing `AnalyticsEntry` record with this key.
3.  **If a record is found**: Increments the `totalViews` and `uniqueViews` counters.
4.  **If a record is not found**: Creates a new `AnalyticsEntry` record with the counters set to 1.

#### `getStats` (data aggregation)
This is the most resource-intensive method that generates data for the dashboard:
1.  Retrieves all `AnalyticsEntry` records for the specified period from the database.
2.  In the application code (not in the database), it iterates over these records to calculate:
    *   Total `totalViews` and `uniqueViews`.
    *   Average `avgBounceRate` and `avgTimeOnPage`.
    *   Top 10 pages, by grouping views by `pageId`, `postId`, etc.
    *   Top 10 sources, by grouping data from nested `ReferrerDetail` records.
3.  Returns a single object with all the aggregated statistics.

## 4. Frontend

*   **Main Component**: `client/app/admin/analytics/page.tsx`
*   **API Clients**: `fetchAnalyticsStats`, `fetchAnalytics` (from `@/src/shared/api/analytics`).

### 4.1. `AnalyticsPage` Component Structure

*   The component is a client component (`"use client"`).
*   **State**:
    *   `stats`: Stores aggregated data received from the `/stats` endpoint.
    *   `recentEntries`: Stores a list of recent entries received from the `/` endpoint.
    *   `loading`: Manages the display of the preloader during loading.
    *   `startDate`, `endDate`: State for the date filter fields.

### 4.2. Data Lifecycle

1.  **Initialization**: When the component mounts and an `accessToken` is present, the `useEffect` hook triggers the `loadData` function.
2.  **Data Fetching**: `loadData` executes two API requests in parallel using `Promise.all`:
    *   `fetchAnalyticsStats(accessToken, { startDate, endDate })` -> requests `/analytics/stats`.
    *   `fetchAnalytics(accessToken, { limit: 10, startDate, endDate })` -> requests `/analytics` to get the last 10 entries.
3.  **State Update**: The received data is written to `stats` and `recentEntries`, which causes the component to re-render.
4.  **Filtering**: Changing the values in the `startDate` or `endDate` fields updates the corresponding state, which again triggers `useEffect` and initiates a re-fetch of the data with the new parameters.
5.  **Rendering**: The component renders data from the `stats` state in summary cards and charts, and data from `recentEntries` in a table.
