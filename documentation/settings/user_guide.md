# FocusWord Application Settings User Guide

This guide provides a comprehensive overview of the "Settings" module within the FocusWord application. This module serves as the central hub for administrators to configure and manage the entire website's behavior, ranging from its fundamental identity and appearance to critical technical configurations such as email delivery and database management.

## Navigating the Settings Page

The settings in FocusWord are intuitively organized into a **tabbed interface** at the top of the page. Each tab represents a distinct category of settings, making it easy to locate and manage specific configurations.

*   **Tabbed Interface:** To access settings related to a particular category (e.g., "General," "Theme," "Mailer," "Database"), simply click on the corresponding tab. This action will reveal all the configurable options pertinent to that category.
*   **Saving Changes:** After making any modifications across one or more tabs, it is crucial to click the **Save Settings** button located at the bottom of the page. This button saves all pending changes from all tabs simultaneously. Changes made will not be applied until this button is clicked.

## Common Setting Types

FocusWord utilizes various input controls to accommodate different types of settings:

*   **Text Input:** Used for simple, single-line data entry, such as the **Site Name** or a recipient email address for testing.
*   **Dropdown (Select):** Provides a predefined list of options, typically for "Yes" or "No" choices, like enabling **Maintenance Mode**.
*   **Text Area:** Designed for entering longer text passages or complex configurations, often in structured formats like JSON, as seen in **Mailer Settings**.

## Detailed Breakdown of Setting Categories (Tabs)

Here's a detailed look at the types of settings available under each primary tab:

### General Settings

This tab covers fundamental information and operational modes for your website.

*   **Site Name:** Defines the public-facing name of your website. This name is typically displayed in browser titles, headers, and other prominent areas.
*   **Site Description:** Allows you to set a short tagline or a brief description of your website, which can be used for SEO purposes or displayed in various parts of your site.
*   **Maintenance Mode:**
    *   Setting this to **Yes** will activate a maintenance page for all regular visitors. During maintenance mode, only authenticated administrators will be able to browse the site, allowing them to perform updates or troubleshooting without impacting the user experience.
    *   Setting this to **No** will return the website to normal operation, making it accessible to all visitors.

### Theme Settings

Control the visual appearance and user experience of your website.

*   **Theme Mode:** This setting features a special UI with **Day** and **Night** buttons. Administrators can use these buttons to set the default color scheme for the entire website, dictating whether it appears in a light (Day) or dark (Night) theme by default.

### Mailer Settings (`mailer_config`)

The Mailer Settings tab is dedicated to configuring how your application sends emails for various functions, such as user notifications, contact form submissions, or password resets.

*   **Configuration:** This is a technical setting typically edited within a **text area** using a specific JSON format. It contains parameters for your SMTP server, authentication details, and other email sending protocols.
*   **Key Feature: Test Mailer:** After entering or updating your JSON mailer configuration, you can verify its correctness using the **Test config** button.
    1.  Click the **Test config** button.
    2.  Enter a valid recipient email address in the provided field.
    3.  The system will attempt to send a test email to the specified address, confirming whether your mailer settings are correctly configured and functional.

### Database Settings

This tab provides advanced tools for managing the site's underlying database. These actions should be performed with extreme caution.

*   **Export Database:** The **Export DB** button allows you to create a complete backup of your website's database. Clicking this button will generate and download a `.zip` file containing all your database records, configurations, and assets. Regular exports are highly recommended for data recovery.
*   **Import Database:** The **Import DB** button enables you to restore your database from a previously exported backup file.
    *   Click the **Import DB** button and upload your `.zip` backup file.
    *   **<span style="color: red; font-weight: bold;">CRUCIAL WARNING:</span> Importing a database will irrevocably **overwrite all existing data** currently in your live database. This action cannot be undone. Always ensure you have a current backup before proceeding with an import, and exercise extreme caution.**

## Protected Settings

To prevent accidental critical changes, some settings within FocusWord are designated as "protected." If an administrator attempts to modify and save a protected setting (such as the Site URL, Database connection strings, or Theme Mode), a **confirmation pop-up** will appear. This pop-up requires explicit confirmation of the intended change, adding an extra layer of security and preventing unintended alterations to vital application configurations.
