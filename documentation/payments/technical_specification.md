# Technical Specification: Payments Module

## 1. Overview

The Payments module is a core component of the application, designed to enable administrators to configure and manage the website's payment systems. This involves setting up third-party payment processors, referred to as "Payment Gateways," and defining the various "Payment Methods" offered to users through these gateways.

The module's architecture is clearly separated, featuring two distinct data models (`PaymentGateway`, `PaymentMethod`) managed by a corresponding pair of backend controllers. A unified service handles the business logic for both entities. On the frontend, a dedicated page provides a tabbed interface for administrators to interact with and manage these payment configurations.

## 2. Data Models

The Payments module is built upon two primary data models, defined using Prisma ORM: `PaymentGateway` and `PaymentMethod`.

### 2.1. `PaymentGateway` Model

The `PaymentGateway` model represents a third-party payment processing service (e.g., Stripe, PayPal).

```prisma
model PaymentGateway {
  id           Int      @id @default(autoincrement())
  name         String   @unique
  slug         String   @unique
  description  String?
  isEnabled    Boolean  @default(false)
  settings     Json?    // Stores provider-specific keys and config
  displayOrder Int      @default(0)

  paymentMethods PaymentMethod[]
}
```

**Fields:**
*   `id`: Unique identifier for the payment gateway.
*   `name`: A human-readable name for the gateway (e.g., "Stripe", "PayPal"). Must be unique.
*   `slug`: A unique, URL-friendly identifier for the gateway.
*   `description`: Optional, provides more details about the gateway.
*   `isEnabled`: A boolean flag indicating whether the gateway is active and available for use. Defaults to `false`.
*   `settings`: This is a `Json` field specifically designed to hold arbitrary configuration data required by the third-party payment provider. This typically includes sensitive information such as API keys, webhook secrets, and other provider-specific settings necessary for integration.
*   `displayOrder`: An integer to control the order in which gateways are displayed in the UI. Defaults to `0`.

**Relationships:**
*   `paymentMethods`: A one-to-many relationship with `PaymentMethod`, indicating that a single payment gateway can offer multiple payment methods.

### 2.2. `PaymentMethod` Model

The `PaymentMethod` model represents a specific payment option available to users (e.g., "Credit Card", "Bitcoin") offered through a payment gateway.

```prisma
model PaymentMethod {
  id          Int      @id @default(autoincrement())
  name        String   @unique
  slug        String   @unique
  isEnabled   Boolean  @default(false)
  type        String   // e.g., 'card', 'crypto'

  gateway          PaymentGateway? @relation(fields: [paymentGatewayId], references: [id])
  paymentGatewayId Int?

  // Relations to content that can be monetized
  pages    Page[]     @relation("PagePaymentMethod")
  articles Article[]  @relation("ArticlePaymentMethod")
  // ... (other monetizable content)
}
```

**Fields:**
*   `id`: Unique identifier for the payment method.
*   `name`: A human-readable name for the payment method (e.g., "Visa/Mastercard", "Bitcoin"). Must be unique.
*   `slug`: A unique, URL-friendly identifier for the method.
*   `isEnabled`: A boolean flag indicating whether the method is active and available for use. Defaults to `false`.
*   `type`: A string field categorizing the payment method (e.g., 'card', 'crypto', 'bank_transfer').

**Relationships:**
*   `gateway`: A many-to-one relationship with `PaymentGateway`, establishing that a `PaymentMethod` belongs to an optional `PaymentGateway`.
*   `paymentGatewayId`: The foreign key linking to the `PaymentGateway` model. This field is nullable, allowing for payment methods that might not be directly tied to a specific third-party gateway (e.g., an internal balance).
*   `pages`, `articles`: Many-to-many relationships with various content types (`Page`, `Article`, etc.) that can be monetized. This allows specific payment methods to be associated with particular content for purchase or access.

## 3. Backend Implementation

The backend for the Payments module follows a clean, separated architecture utilizing NestJS.

### 3.1. Dual-Controller Architecture

The backend logic is explicitly separated into two dedicated controllers to ensure clear API boundaries and maintainability for each entity:

1.  **`PaymentGatewayController`:** Manages all CRUD (Create, Read, Update, Delete) operations specifically for `PaymentGateway` entities. Its base endpoint is `/payment-gateways`.
2.  **`PaymentMethodController`:** Manages all CRUD operations specifically for `PaymentMethod` entities. Its base endpoint is `/payment-methods`.

This separation enhances code organization and allows for independent evolution of the API for each payment entity.

### 3.2. API Endpoints

Both controllers expose a consistent set of RESTful API endpoints:

*   **`GET /`**: Retrieve a list of all `PaymentGateway` or `PaymentMethod` entities.
*   **`GET /:id`**: Retrieve a single `PaymentGateway` or `PaymentMethod` entity by its unique ID.
*   **`POST /`**: Create a new `PaymentGateway` or `PaymentMethod` entity. The request body is expected to contain the necessary data transfer object (DTO).
*   **`PUT /:id`**: Update an existing `PaymentGateway` or `PaymentMethod` entity identified by its ID. The request body contains the updated data.
*   **`DELETE /:id`**: Delete a `PaymentGateway` or `PaymentMethod` entity by its ID.

Additionally, both controllers feature a specialized endpoint for activation/deactivation:

*   **`PATCH /:id/toggle`**: This endpoint provides a lightweight mechanism to change the `isEnabled` status of a `PaymentGateway` or `PaymentMethod`. It expects a boolean `isEnabled` in the request body to activate or deactivate the entity.

### 3.3. `PaymentsService`

A single `PaymentsService` encapsulates all business logic related to both `PaymentGateway` and `PaymentMethod` entities. This service is injected into both `PaymentGatewayController` and `PaymentMethodController`.

*   **Unified Business Logic:** The service contains duplicate sets of methods, one for each entity (e.g., `findAllGateways()`, `createGateway(dto)` for gateways, and `findAllMethods()`, `createMethod(dto)` for methods). This centralization ensures consistent application of business rules across both controllers.
*   **Database Interaction:** The `PaymentsService` directly utilizes `PrismaService` to interact with the underlying database.
*   **No Caching:** No caching mechanisms are implemented within the service for payment configuration data. This design choice ensures that all data fetched is always fresh and directly reflects the current database state, which is crucial for financial configurations.

### 3.4. Security

Robust security measures are in place to protect all API endpoints within the Payments module:

*   **Authentication (`JwtAuthGuard`):** All endpoints in both `PaymentGatewayController` and `PaymentMethodController` are protected by `JwtAuthGuard`, ensuring that only authenticated users can access them.
*   **Authorization (`PermissionsGuard`):** A `PermissionsGuard` is applied to enforce Role-Based Access Control (RBAC).
*   **Permission Decorators:** The `@HasPermission('payment:X')` decorator is used to specify required permissions for different operations:
    *   `payment:0`: Required for read operations (e.g., `GET /`, `GET /:id`).
    *   `payment:2`: Required for write operations (e.g., `POST /`, `PUT /:id`, `DELETE /:id`, `PATCH /:id/toggle`).
    This granular control ensures that users only have access to the payment configuration operations they are authorized to perform.

## 4. Frontend Implementation (`PaymentsPage`)

The administrative interface for the Payments module is a single, comprehensive `PaymentsPage` component.

### 4.1. Component Architecture

*   **Single Stateful Component:** The entire payments management UI is encapsulated within one stateful React component.
*   **Tabbed Layout:** The component employs a tabbed layout, effectively separating the management interface for "Payment Gateways" and "Payment Methods." This design improves user experience by organizing related functionalities.

### 4.2. State Management

*   **`activeTab`:** A state variable (`'gateways' | 'methods'`) controls which tab's content is currently displayed to the user.
*   **Data Storage:** Upon component mount, lists of both `PaymentGateways` and `PaymentMethods` are fetched from the backend API and stored in separate state arrays within the component (e.g., `gateways` and `methods`). These state variables are then used to render the respective lists in their tabs.

### 4.3. "Payment Gateways" Tab

This tab provides a full-featured CRUD interface for managing `PaymentGateway` entities.

*   **CRUD Interface:**
    *   Gateways are displayed in a tabular format, showing key details.
    *   Action buttons are provided for "Create," "Edit," "Delete," and "Toggle" (to change `isEnabled` status).
*   **Create/Edit Form (`Modal`):**
    *   A modal dialog is used for the creation and editing of payment gateways. This keeps the form isolated and user-focused.
*   **`settings` JSON Field Handling:**
    *   The `settings` field, which is of type `Json` in the backend, is managed on the frontend using a simple `<textarea>`.
    *   When fetching data for editing, `JSON.stringify()` is used to convert the JSON object into a string for display in the textarea.
    *   Before sending data to the backend API (for create or update), `JSON.parse()` is used to convert the string content from the textarea back into a JSON object. This ensures proper data format for the backend.

### 4.4. "Payment Methods" Tab

This tab presents a read-only view of the configured `PaymentMethod` entities.

*   **Read-Only UI:** The UI in this tab primarily consists of a table displaying the details of the available payment methods.
*   **Limited Functionality:** While the backend API fully supports CRUD operations for payment methods, this specific part of the administrator panel **does not expose** create, edit, or delete functionality. This implies that `PaymentMethod` entities might be managed programmatically, through a different dedicated interface, or are primarily designed to be configured once and then largely static from this particular admin view.