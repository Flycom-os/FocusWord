# User Management: Administrator Guide

This guide provides a comprehensive overview of the "Users" module within the application, specifically designed for administrators managing user accounts in the `/admin/users` section.

## 1. Introduction to User Management

The Users module is the central hub for administrators to manage all user accounts within the system. As an administrator, you have the ability to:

*   Create new user accounts.
*   Edit existing user details and assigned roles.
*   Assign specific roles to users, controlling their access and permissions.
*   Delete user accounts.

## 2. The Main Users Page (`/admin/users`)

Upon navigating to `/admin/users`, you will be presented with the main user management interface. This page displays a paginated table listing all registered users in the system.

The table includes the following columns:

*   **Email**: The primary email address used by the user for login and communication.
*   **Name**: The full name of the user (composed of First Name and Last Name, if provided).
*   **Role**: The assigned role of the user, which dictates their permissions and access levels within the application and admin panel.
*   **Date Created**: The date and time when the user account was initially created.

### Toolbar Actions

The toolbar at the top of the users table provides convenient actions for managing user accounts:

*   **Search**: The search bar allows you to quickly find specific users. You can search by **Email**, **Name**, or **Username** to filter the list and locate accounts efficiently.
*   **Add User**: Click the **Add User** button to open a modal form for creating a new user account.

## 3. Managing Users

This section details the processes for creating, editing, and deleting user accounts.

### Creating a User

To create a new user account:

1.  Click the **Add User** button in the toolbar.
2.  A modal dialog will appear, presenting a form for new user details.
3.  Fill in the required and optional fields:
    *   **Email (required)**: Enter the unique email address that the user will use to log in.
    *   **Password (required)**: Set a temporary password for the new user. The user will typically be prompted to change this upon their first login.
    *   **Username (optional)**: A unique identifier for the user.
    *   **First Name (optional)**: The user's first name.
    *   **Last Name (optional)**: The user's last name.
    *   **Role**: This is a crucial field. Use the dropdown menu to select a specific role for the new user (e.g., "Administrator," "Editor," "Subscriber"). The assigned role will determine the user's permissions and what actions they can perform within the admin panel and the application.
4.  Click **Save** to create the user account.

### Editing a User

To modify an existing user's details or role:

1.  Locate the user in the table you wish to edit.
2.  Click the **Edit** button corresponding to that user's row.
3.  A modal dialog, similar to the "Add User" form, will appear, pre-filled with the user's current information.
4.  You can update the user's **First Name**, **Last Name**, **Email**, and, most importantly, change their assigned **Role** using the dropdown menu.
    *   **Note**: For security reasons, the user's password cannot be edited from this screen. Password resets are typically handled through a separate process or by the user themselves.
5.  Click **Save** to apply your changes.

### Deleting a User

To permanently remove a user account from the system:

1.  Locate the user in the table you wish to delete.
2.  Click the **Delete** button corresponding to that user's row.
3.  A confirmation pop-up will appear, asking you to confirm the deletion.
    *   **Warning**: Deleting a user account is a permanent action and cannot be undone. All associated data for that user will be removed.
4.  Confirm the deletion to proceed.

## 4. Permissions Note

It is important to understand that your ability as an administrator to see and interact with certain buttons, such as **Add User**, **Edit**, and **Delete**, is contingent upon your *own* assigned role and its associated permissions. For example, an administrator with a more restricted role (e.g., "Editor" with limited access to user management) might be able to view the list of users but will not see the buttons to create new users or delete existing ones. This system ensures that actions are only available to users with the appropriate level of authorization.
