# Payments Module User Guide

This guide provides a comprehensive overview of the Payments module, explaining how administrators can configure and manage payment options within the application.

## 1. Introduction to the Payments System

The Payments module is essential for configuring how your website accepts and processes payments from customers. It serves as the central hub for integrating with various payment providers and defining the payment options presented during the checkout process.

At its core, the Payments system revolves around two main concepts:

*   **Payment Gateways:** These are the third-party payment processors with whom your organization has an account (e.g., Stripe, PayPal, Braintree). The application connects to these external services through the configurations you establish here. Each gateway handles the secure processing of transactions, but you must have an existing account with them to use their services.
*   **Payment Methods:** These represent the specific payment options that customers see and can choose from when making a purchase (e.g., "Credit Card," "PayPal Balance," "Bank Transfer"). Each payment method is intrinsically linked to and powered by one or more configured **Payment Gateways**.

## 2. The Main Payments Page (`/admin/payments`)

Navigating to `/admin/payments` will present you with the main administration interface for the Payments module. This page features a clear tabbed layout to help you organize your work:

*   **Payment Gateways tab:** This is where you will spend most of your time, configuring the connections to your third-party payment processors.
*   **Payment Methods tab:** This tab provides an overview of all available payment options.

Administrators will primarily interact with the **Payment Gateways** tab to set up and manage their payment integrations.

## 3. Managing Payment Gateways

The **Payment Gateways** tab is where you define and manage the connections to your external payment processors.

### The Gateway List

Upon selecting the **Payment Gateways** tab, you will see a table listing all currently configured payment gateways. For each gateway, the table displays:

*   **Name:** The user-friendly name you've assigned to the gateway.
*   **Slug:** A unique system identifier for the gateway.
*   **Status:** Indicates whether the gateway is **Active** (enabled) or **Inactive** (disabled), controlling its availability for processing payments.

### Creating a New Gateway

To integrate a new payment processor, click the **"Create Gateway"** button. This action will open a modal dialog where you can input the necessary configuration details:

*   **Name:** Provide a human-readable name for the gateway (e.g., "**Stripe (Live Account)**," "**PayPal Sandbox**"). This name helps you identify the gateway within the admin panel.
*   **Slug:** A unique, system-friendly identifier for the gateway (e.g., `stripe-live`, `paypal-test`). This should be concise and descriptive.
*   **Description:** (Optional) Use this field to add any internal notes or reminders about this specific gateway configuration.
*   **Display Order:** If you have multiple gateways that can be used for the same payment method, this numerical value determines the order in which they might be prioritized or displayed.
*   **Settings (JSON):** **This is the most critical field.** In this text area, you must paste the API keys, credentials, and any other specific configuration parameters provided by your payment processor. The data must be in **valid JSON format**. Any syntax errors will prevent the gateway from being saved or functioning correctly.

    Always consult the documentation of your specific payment processor for the exact keys and parameters required.
*   **Enabled:** This checkbox allows you to activate or deactivate the gateway. An enabled gateway can process transactions, while a disabled one cannot.

### Editing a Gateway

To modify an existing gateway's configuration, locate it in the gateway list and click the **"Edit"** button associated with it. This will reopen the same modal dialog used for creation, pre-populated with the gateway's current settings, allowing you to make updates.

### Toggling a Gateway

The gateway list provides a quick **"Enable/Disable"** toggle button for each entry. This allows you to rapidly activate or deactivate a gateway without needing to open the full edit modal. This is useful for quickly taking a gateway offline for maintenance or bringing it back online.

### Deleting a Gateway

To permanently remove a gateway configuration, click the **"Delete"** button next to the desired entry in the gateway list. **Be aware that this action is irreversible and will remove all associated settings.** Ensure no active payment methods rely solely on this gateway before deleting it.

## 4. Viewing Payment Methods

The **Payment Methods** tab provides a read-only overview of the various payment options available in your system.

### The Methods List

When you switch to the **Payment Methods** tab, you will see a list detailing each payment method. For each method, the following information is displayed:

*   **Name:** The name of the payment method (e.g., "Credit Card," "PayPal").
*   **Type:** The category of the payment method (e.g., `card`, `bank`, `e-wallet`).
*   **Status:** Indicates whether the method is currently active and available for customers.
*   **Gateway:** The name of the **Payment Gateway** that powers this specific payment method.

### Read-Only View

It's important to note that this tab is primarily for **viewing** the available payment methods. You cannot directly create, edit, or delete payment methods from this interface. The availability and configuration of these methods are implicitly tied to the **Payment Gateways** you set up and the underlying application code that defines which methods are exposed by each gateway. If you need to enable or disable a particular payment method, you would typically do so by managing the associated **Payment Gateway** or through system-level configurations that determine which methods a gateway offers.