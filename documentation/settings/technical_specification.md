# Settings Module: Technical Specification

## 1. Overview

The Settings module provides a centralized and user-friendly interface for managing global application configurations. It is built on a key-value data model with rich metadata to support dynamic UI generation. The backend exposes an action-oriented API designed for efficient batch updates, while the frontend renders a dynamic, tabbed interface based on setting categories.

## 2. Data Model

The core of the module is the `Setting` entity, defined in the `prisma.schema.prisma` file. This model stores individual configuration items.

### `Setting` Table Schema

```prisma
model Setting {
  id          Int      @id @default(autoincrement())
  key         String   @unique
  value       String
  type        String   @default("string")
  description String?
  category    String   @default("general")
}
```

### Key Fields

*   `id`: (Integer) The primary key for the database record.
*   `key`: (String) The unique machine-readable identifier for the setting. This key is used by the application to retrieve its value (e.g., `mailer_host`, `site_title`).
*   `value`: (String) The stored value of the setting, serialized as a string. The frontend is responsible for parsing this value based on the `type` field.
*   `type`: (String) A metadata field that dictates the UI control to be rendered on the frontend. Supported types include:
    *   `"string"`: Renders a standard text input.
    *   `"number"`: Renders a number input.
    *   `"boolean"`: Renders a select/dropdown with "True" and "False" options.
    *   `"json"`: Renders a textarea, expecting a JSON string.
    *   Custom types can be added to support more complex UI controls.
*   `description`: (String, Optional) A user-friendly description of the setting's purpose, often displayed as a tooltip or helper text in the UI.
*   `category`: (String) A metadata field used to group related settings. The frontend uses categories to organize settings into distinct tabs (e.g., `"general"`, `"theme"`, `"database"`, `"mailer"`).

## 3. Backend Implementation

The backend is built with NestJS and consists of a `SettingsController` and a `SettingsService`.

### 3.1. API Endpoints (`SettingsController`)

The controller's endpoints are action-oriented rather than strictly RESTful, aligning with the UI's operational needs. All endpoints are protected by `JwtAuthGuard`, requiring administrator-level authentication.

#### `GET /settings`
*   **Description**: Retrieves a complete list of all settings from the database.
*   **Response Body**: `Setting[]`

#### `GET /settings/category/:category`
*   **Description**: Retrieves all settings belonging to a specific category.
*   **URL Parameters**:
    *   `category`: The name of the category to filter by.
*   **Response Body**: `Setting[]`

#### `GET /settings/:key`
*   **Description**: Retrieves a single setting by its unique key.
*   **URL Parameters**:
    *   `key`: The unique key of the setting.
*   **Response Body**: `Setting`

#### `PUT /settings/batch`
*   **Description**: **This is the primary endpoint for updating settings.** It accepts an array of key-value pairs, allowing the frontend to save all modified settings across all tabs in a single transaction.
*   **Request Body**:
    ```json
    {
      "settings": [
        { "key": "setting_one_key", "value": "new_value_1" },
        { "key": "setting_two_key", "value": "new_value_2" }
      ]
    }
    ```
*   **Query Parameters**:
    *   `force`: (Boolean, Optional) If `true`, the endpoint will allow the update of "protected" settings that are critical to the application's function. This requires explicit user confirmation on the frontend.
*   **Response**: A confirmation message or the updated settings.

#### `PUT /settings/:key`
*   **Description**: Updates a single setting value. Less commonly used than the batch update.
*   **URL Parameters**:
    *   `key`: The key of the setting to update.
*   **Request Body**:
    ```json
    {
      "value": "new_setting_value"
    }
    ```
*   **Query Parameters**:
    *   `force`: (Boolean, Optional) Same as the batch update endpoint.

### 3.2. Service Logic (`SettingsService`)

The `SettingsService` contains the core business logic for managing settings.

*   **`updateMultiple(settings: { key: string; value: string }[], force: boolean)`**: This is the central method for processing batch updates. It iterates through the provided array of settings. For each setting, it checks its `key` against an internal, predefined list of protected keys (e.g., database credentials, core API URLs). If an update to a protected key is attempted without `force=true`, the service throws a `ForbiddenException`, preventing the change.

*   **Caching**: Caching (e.g., with Redis) is intentionally omitted for the settings module. This ensures that the application always fetches the most current configuration values directly from the database, preventing issues with stale data.

*   **Special Actions**: The service also includes methods for handling special, non-standard operations that are triggered from the settings UI, such as `testMailer`, `exportDatabase`, and `importDatabase`. These are typically exposed through dedicated controller endpoints and are not part of the standard CRUD lifecycle.

## 4. Frontend Implementation

The frontend is implemented as a stateful React component (`SettingsPage`) responsible for fetching, rendering, and saving all application settings.

### 4.1. Component Architecture & State Management

*   **Component**: A single, large component (`settings/index.tsx`) manages the entire settings interface.
*   **State Management**:
    1.  **Settings Data**: On component mount (`useEffect`), an API call is made to `GET /settings` to fetch all setting records. This data is stored in a state variable.
    2.  **Form State**: A single state object, `formData: Record<string, string>`, holds the current values of all settings being edited. The keys of this object correspond to the `setting.key`, and the values are the user's input. This unified state object allows for easy tracking of changes across multiple tabs.
    3.  **UI State**: Additional state variables track the active tab and loading/error states.

### 4.2. Dynamic UI Rendering

The UI is dynamically generated based on the fetched settings data.

*   **Tab Generation**: The component derives a unique list of categories from the settings data and uses it to render a tabbed navigation interface.
*   **Field Rendering (`renderField` function)**: The core of the dynamic UI is a `renderField(setting)` function. The component filters the settings for the currently active tab and maps over them, calling `renderField` for each one.
    *   Inside this function, a `switch` statement on `setting.type` determines which React input component to render.
    *   **Example Cases**:
        *   `case "string"`: Returns an `<input type="text">`.
        *   `case "boolean"`: Returns a `<select>` with `<option>`s for "True" and "False".
        *   `case "number"`: Returns an `<input type="number">`.
        *   `case "json"`: Returns a `<textarea>`.
    *   This architecture is highly extensible. To support a new type of setting, a developer only needs to add a new `case` to the `switch` statement and the corresponding component.

### 4.3. Saving Data (`handleSave`)

*   **Data Transformation**: When the "Save" button is clicked, the `handleSave` function is triggered. It transforms the `formData` state object from `Record<string, string>` back into the array format required by the batch update API: `{ key: string; value: string }[]`.

*   **Protected Settings Confirmation**: Before calling the API, the function checks if any of the modified keys are present in a hardcoded frontend list of `PROTECTED_DEFAULT_KEYS`.
    *   If a protected key has been modified, it uses a native `window.confirm()` dialog to ask for explicit user confirmation ("This is a critical setting. Are you sure you want to change it?").
    *   If the user confirms, the `force` flag is set to `true` for the subsequent API call.

*   **API Call**: The function calls the `updateMultipleSettings` API service, which makes the `PUT /settings/batch` request, passing the transformed settings array and the `force` flag if applicable.

### 4.4. Specialized UI Logic

The component contains logic for handling non-standard settings and actions:

*   **Custom Field Renders**: The `renderField` function may contain special `case` blocks for specific setting keys (e.g., for `key === 'theme_mode'`, it might render a set of buttons instead of a standard input).
*   **Action Buttons**: For categories like `"database"`, the component renders dedicated buttons (e.g., "Export Database," "Import Database") that are not tied to the standard `formData` lifecycle. These buttons have their own `onClick` handlers (`handleExportDatabase`, `handleImportDatabase`) that call specialized API endpoints.
