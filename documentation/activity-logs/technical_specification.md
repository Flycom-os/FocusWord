# Technical Specification: Activity Logs Module

## 1. Overview

The Activity Logs module is a critical component of the application, designed to provide a comprehensive audit trail of user actions. It records significant events and changes made across various parts of the system, offering transparency and traceability. The module consists of a robust backend API for managing log data and a read-only frontend interface that allows administrators to view and analyze these logs. The frontend presents this data through two primary views: a detailed, searchable log table for granular inspection and a high-level statistics dashboard for aggregate insights.

## 2. Data Model (`ActivityLog`)

The core entity within this module is the `ActivityLog`, defined in the Prisma schema as follows:

```prisma
model ActivityLog {
  id         Int      @id @default(autoincrement())
  action     String   // e.g., "PAGE_UPDATE"
  entityType String?  // e.g., "Page"
  entityId   Int?     // The ID of the affected entity
  details    Json?    // Extra metadata about the event
  timestamp  DateTime @default(now())
  ipAddress  String?

  user   User? @relation(fields: [userId], references: [id])
  userId Int?
}
```

### Field Definitions:

*   **`id`**: A unique identifier for each activity log entry. It is an auto-incrementing integer, ensuring each log has a distinct and sequential ID.
*   **`action`**: A string representing the specific action performed (e.g., "USER_LOGIN", "PAGE_CREATE", "PRODUCT_DELETE"). This field provides a clear, human-readable description of the event.
*   **`entityType`**: An optional string indicating the type of application entity that was affected by the action (e.g., "User", "Page", "Product"). This helps categorize logs and facilitates filtering.
*   **`entityId`**: An optional integer representing the unique identifier of the specific entity instance that was affected (e.g., the ID of the page that was updated). This allows direct linking to the affected resource.
*   **`details`**: An optional `Json` field designed for maximum flexibility. It stores any additional, context-specific metadata pertinent to the event. This could include old and new values for changed fields, reasons for an action, or other relevant contextual information that doesn't fit into the other structured fields.
*   **`timestamp`**: A `DateTime` field that automatically records the exact moment the activity log entry was created, defaulting to the current time.
*   **`ipAddress`**: An optional string that stores the IP address from which the action originated, useful for security auditing and identifying suspicious activity.
*   **`user`**: A relation to the `User` model, linking the activity log entry to the user who performed the action.
*   **`userId`**: An optional integer foreign key referencing the `id` of the `User` who performed the action.

## 3. Backend Implementation (`ActivityLogsService`, `ActivityLogsController`)

The backend is responsible for the persistent storage, retrieval, and management of activity log data, exposing a comprehensive API.

### API Endpoints (`ActivityLogsController`):

The `ActivityLogsController` provides the HTTP interface for interacting with the activity logs.

#### Read Endpoints:

*   **`GET /activity-logs`**: Fetches a paginated and searchable list of all activity log entries. This endpoint supports various query parameters for filtering, sorting, and pagination.
*   **`GET /activity-logs/:id`**: Retrieves a single, specific activity log entry by its unique `id`.
*   **`GET /activity-logs/stats`**: An aggregation endpoint that calculates and returns statistical data about activity logs. This includes metrics such as total actions, actions grouped by type, and other relevant summaries.
*   **`GET /activity-logs/action-types`**: A utility endpoint that returns a list of all distinct `action` values present in the database, intended for populating filter options in the UI.
*   **`GET /activity-logs/entity-types`**: A utility endpoint that returns a list of all distinct `entityType` values present in the database, also for UI filter population.

#### Write Endpoints:

*   **`POST /activity-logs`**: An endpoint designed for internal use by other backend services to create new activity log entries. **It is crucial to note that this endpoint is not intended to be called directly by the frontend, ensuring proper encapsulation of log creation logic within the backend.**

#### Delete Endpoints:

*   **`DELETE /activity-logs/:id`**: Deletes a single activity log entry identified by its `id`.
*   **`DELETE /activity-logs/cleanup`**: A powerful batch operation that deletes multiple old activity log entries. It accepts a `olderThanDays` query parameter to specify the age threshold for logs to be removed.

### Security:

All endpoints within the `ActivityLogsController` are protected to ensure data integrity and authorized access:

*   **`JwtAuthGuard`**: Authenticates requests using JSON Web Tokens.
*   **`PermissionsGuard`**: Authorizes requests based on specific permissions. Access to activity log operations is controlled by permissions such as `activity-logs:read`, `activity-logs:create`, and `activity-logs:delete`.

### `ActivityLogsService`:

The `ActivityLogsService` encapsulates the business logic and data access operations for the activity logs, primarily interacting with the Prisma ORM.

*   **`findAll`**: Implements the logic for retrieving activity log entries, incorporating filtering based on criteria provided in an `ActivityLogFilterDto` (e.g., by `action`, `entityType`, `userId`, date range, search terms) and handling pagination.
*   **`getStats`**: Contains the complex aggregation queries necessary to compute the various statistics returned by the `GET /activity-logs/stats` endpoint. This involves querying the database to group and count log entries based on different criteria.
*   **`cleanup`**: Executes a `deleteMany` Prisma query with a `WHERE` clause based on the `timestamp` field and the `olderThanDays` condition, efficiently removing old log data from the database.

### Caching Strategy:

*   **No Caching**: Unlike some other modules, the `ActivityLogsService` explicitly **does not** utilize Redis caching. This decision is intentional and appropriate for log data, where real-time accuracy and immediate visibility of new events are paramount. Caching could introduce delays in displaying the latest activities, which would diminish the value of an audit trail.

## 4. Frontend Implementation (`ActivityLogsPage`)

The frontend component (`ActivityLogsPage`) provides a read-only interface for administrators to view and analyze activity logs. It is built as a single, stateful React component.

### Component Architecture:

*   The `ActivityLogsPage` manages its internal state, most notably an `activeTab` variable. This state variable controls which sub-view is currently displayed: either the "Logs" tab (for detailed log entries) or the "Statistics" tab (for the aggregate dashboard).

### Data Fetching:

*   Data retrieval is managed by an `useEffect` hook. This hook triggers a `loadData` function both when the component mounts and whenever relevant filter criteria (e.g., search terms, pagination changes) are updated.
*   The `loadData` function efficiently fetches data for both tabs concurrently using `Promise.all`. It makes parallel calls to `fetchActivityLogs` (for the "Logs" tab) and `fetchActivityStats` (for the "Statistics" tab), updating the component's state upon completion.

### "Logs" Tab View:

*   This view renders a `Table` component to display the paginated list of individual activity log entries fetched from the `GET /activity-logs` API endpoint.
*   It includes an `<input>` field that allows users to search within the log entries. The value entered into this input is stored in a `search` state variable, which is then passed as a query parameter to `fetchActivityLogs` during subsequent data fetches.
*   A `Pagination` component is rendered to control the current `page` state, allowing users to navigate through the log entries.

### "Statistics" Tab View:

*   This view serves as a simple dashboard, presenting aggregate data derived from the `GET /activity-logs/stats` API endpoint.
*   It renders the summarized data into visually appealing "stat cards" (e.g., displaying `stats.totalActions`, `stats.actionsByType`).
*   Additionally, it iterates over the `stats.recentActions` array to display a concise list of the most recent events, providing a quick overview of system activity.

### Read-Only Implementation:

*   **Crucially, the `ActivityLogsPage` frontend component is designed as a purely read-only interface.** It exclusively calls the `GET` endpoints provided by the backend API (`/activity-logs`, `/activity-logs/:id`, `/activity-logs/stats`, `/activity-logs/action-types`, `/activity-logs/entity-types`).
*   There is no user interface provided within this component for directly initiating `POST` (create) or `DELETE` (delete) operations on activity logs. This design choice ensures that the frontend serves solely as a data consumption and analysis tool for administrators, preventing accidental or unauthorized modifications to the audit trail.