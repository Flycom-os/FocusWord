# User Guide: Managing Roles and Permissions

This guide explains how administrators can effectively manage user permissions within the system using the "Roles" module. Understanding and correctly configuring roles is crucial for maintaining the security and operational integrity of the website.

## 1. Introduction to Roles and Permissions

In this system, a **Role** is a predefined collection of permissions that dictate what a user can see, create, edit, or delete. Roles are the cornerstone of the website's security model, offering a structured and efficient way to manage user access. Instead of assigning individual permissions to each user, which can become unwieldy, administrators assign a user to a specific role (e.g., "Editor," "Author," "Administrator"). This simplifies user management and ensures consistent permission sets across groups of users.

## 2. The Main Roles Page (`/admin/roles`)

The main entry point for managing roles is the `/admin/roles` page. This page presents a paginated table listing all currently defined roles in the system.

Each row in the table provides key information about a role:

*   **Name:** The unique identifier for the role (e.g., "Administrator", "Content Manager").
*   **Description:** A brief explanation of the role's purpose or responsibilities.
*   **Permissions:** A concise summary of the permissions granted to this role.

Standard actions are available for each role, typically presented as buttons:

*   **Add Role:** Initiates the creation of a new role.
*   **Edit:** Allows modification of an existing role's name, description, and permissions.
*   **Delete:** Removes a role from the system.

**Note:** The visibility of these action buttons depends on your own administrative permissions. If you do not have the necessary permissions to manage roles, these buttons may be hidden.

## 3. Creating and Editing Roles

To create a new role, click the "Add Role" button. To modify an existing role, click the "Edit" button next to the desired role in the table. Both actions will typically open a modal dialog containing a form for role configuration.

The form includes the following fields:

*   **Name (required):** Enter a clear and descriptive name for the role. This name should be unique and easily identify the role's function (e.g., "Content Manager," "Product Editor").
*   **Description (optional):** Provide a brief explanation of what the role is for, its primary responsibilities, or any specific notes relevant to its use. This helps future administrators understand the role's purpose.

### Managing Permissions (The Most Important Section)

This section is where you define the specific capabilities granted by the role. Permissions are managed as a list of text "tags," each representing a specific action or level of access to a resource.

You will find an input field where you can type a permission string.

#### Permission String Format

Permissions adhere to a strict `resource:level` format:

*   **`resource`:** Refers to a specific module or feature within the application (e.g., `pages`, `users`, `articles`, `blog`, `media-files`, `roles`).
*   **`level`:** An integer representing the degree of access to that resource. The common levels are:
    *   **`0` (View):** Can only view/read the resource.
    *   **`1` (Edit):** Can view and edit existing resources.
    *   **`2` (Manage):** Can view, edit, create, and delete resources. This is the highest level of access for a resource.

**Examples of Permission Strings:**

*   `pages:0`: Users with this permission can only **view** pages. They cannot create, edit, or delete them.
*   `pages:1`: Users can **view and edit** existing pages.
*   `pages:2`: Users have full management capabilities over pages: they can **view, edit, create, and delete** pages.
*   `users:0`: Users can **view** the list of users.
*   `roles:2`: This is a critical "meta-permission" that allows users to **fully manage roles** themselves (view, edit, create, delete roles).

#### Adding a Permission

1.  Type the desired permission string (e.g., `articles:1`) into the input field.
2.  Click the "Add" button (or similar control, like pressing Enter).
3.  The permission will then appear as a distinct tag below the input field, forming a list of permissions assigned to this role.

#### Removing a Permission

Each permission tag in the list will typically have a small `×` button next to it. Clicking this `×` button will immediately remove that permission from the role.

## 4. Example Role: "Author"

To illustrate how roles and permissions work, let's create an example "Author" role.

*   **Role Name:** `Author`
*   **Description:** Can create and edit their own articles and blog posts, and view media files to include in their content.

To configure this role, you would add the following permission strings:

*   `articles:1`
    *   This grants the author the ability to view and edit articles. Depending on your system's specifics, this might apply to their own articles or all articles.
*   `blog:1`
    *   This grants the author the ability to view and edit blog posts. Similarly, this might be restricted to their own posts.
*   `media-files:0`
    *   This allows the author to view and select existing images or other media files to embed in their articles or blog posts, but prevents them from uploading new files or deleting existing ones.

## 5. Deleting Roles

Deleting a role is a significant and irreversible action. When a role is deleted, any users who were assigned to that role will immediately lose all permissions associated with it. This could potentially leave users without necessary access or disrupt their workflow.

Therefore, deleting a role typically requires a confirmation step to prevent accidental removal. Always ensure you understand the implications before proceeding with a role deletion.