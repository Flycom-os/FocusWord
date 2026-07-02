# Activity Logs User Guide

## 1. Introduction to Activity Logs

The Activity Logs module serves as a comprehensive audit trail, meticulously recording significant actions performed by users across the website. This includes operations such as creating a page, logging in, or deleting a comment. The primary purpose of this module is to empower administrators with the ability to monitor site activity, track changes, and efficiently investigate any issues that may arise. It provides transparency and accountability for all recorded user interactions.

## 2. Navigating the Activity Logs Page

The Activity Logs page is designed with a clear, tabbed interface at the top, allowing for easy navigation between different views of the logged data:

*   **Logs:** This is the default view. It presents a detailed, chronological list of every recorded action, offering an granular look at site events.
*   **Statistics:** This tab provides a dashboard-like summary, offering a high-level overview of overall site activity and key metrics.

## 3. The "Logs" Tab

The **Logs** tab displays individual log entries in a structured table format, providing all the necessary details for each action.

### The Log Table

Each row in the table represents a single action and includes the following columns:

*   **Action:** Describes the type of operation performed (e.g., `create`, `update`, `login`, `delete`). An associated icon visually aids in quickly identifying the action type.
*   **Entity:** Indicates the type of item or resource that was affected by the action (e.g., `Page`, `User`, `Comment`, `Product`).
*   **ID:** Displays the unique identifier of the specific item that was affected. This allows administrators to quickly locate the exact resource in question.
*   **User:** Shows the unique identifier (ID) of the user who initiated and performed the action.
*   **IP Address:** Records the IP address from which the action was performed, useful for security audits and identifying access origins.
*   **Date:** Provides the exact date and time (including timestamp) when the action took place, ensuring precise chronological tracking.

### Searching and Filtering

At the top of the **Logs** tab, you will find a "Search actions..." bar. Administrators can utilize this search bar to filter the displayed logs by various keywords. This allows for targeted investigations, such as searching for:

*   A specific user's IP address.
*   A particular action type, like `delete` or `login`.
*   An entity type, such as `Page` or `User`.

### Pagination

To manage large volumes of log data, the log table incorporates pagination. Controls located at the bottom of the table allow you to navigate through older entries, ensuring that all historical data remains accessible without overwhelming the display.

## 4. The "Statistics" Tab

The **Statistics** tab functions as a dashboard, offering a quick and insightful overview of overall site activity. It summarizes key aspects of the logged data, providing valuable high-level insights.

### Key Metrics

This tab features several summary cards that highlight important metrics:

*   **Total Actions:** Shows the grand total number of all events that have been recorded in the activity logs.
*   **Types of Actions:** Indicates the number of unique action types that have occurred (e.g., if `create`, `update`, and `delete` actions have all taken place, this metric would show '3').
*   **Active Users:** Displays the total count of unique users who have performed at least one recorded action within the system.

### Recent Actions

Below the key metrics, the **Statistics** tab includes a list of **Recent Actions**. This section provides a real-time snapshot of the most recently performed actions on the site, allowing administrators to quickly see what is currently happening without needing to switch to the detailed logs view.