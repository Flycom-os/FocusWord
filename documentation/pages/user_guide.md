# Pages Module User Guide

## 1. Introduction to Pages

The "Pages" module is your primary tool for creating static content within the application, forming the foundational elements of your website. Think of pages as the building blocks for static content such as an "About Us" page, a "Contact" page, a "Privacy Policy," or any other informational content that doesn't change frequently.

Pages are highly flexible, allowing for rich content creation, comprehensive SEO configurations, and the establishment of complex hierarchical structures. While similar in concept to other content modules, Pages offer unique features tailored for managing structured, static web content effectively.

## 2. The Main Pages Page (`/admin/pages`)

Navigating to `/admin/pages` presents you with a list view of all created pages. This view typically displays pages in a table or grid format, providing an overview of your site's static content.

Key features of this page include:

*   **Page Hierarchy:** A distinguishing feature is the ability to visualize the page hierarchy. Child pages are typically indented under their respective parent pages, making it easy to understand the organizational structure of your website (e.g., "About Us" might have "Our Team" and "Our Mission" as child pages).
*   **Standard Actions:** For each page, you'll find common action buttons:
    *   **Create Page:** Initiates the process of creating a new page.
    *   **Edit:** Allows you to modify an existing page's content and settings.
    *   **Delete:** Removes a page from the system.
    *   **View:** Opens the live version of the page on the frontend of your website.
*   **Filtering and Searching:** Tools are available to filter and search through your pages, helping you quickly locate specific content, especially on sites with many pages.

## 3. Creating and Editing Pages

The page editor is a powerful interface designed to give you full control over your content. It is structured into a **Main Content Column** and a **Settings Sidebar**.

### Main Content Column

This area is dedicated to the core content of your page.

*   **Title:** This is the main headline for your page, displayed prominently on the website.
*   **Content Editor:** This is a sophisticated block-based editor that provides a rich environment for crafting your page's content.
    *   **Media and Sliders:** You can easily embed images, videos, and pre-configured **Sliders** directly into your page content. Sliders are dynamic carousels of images or other media, useful for showcasing multiple items in a compact space.
    *   **Key Feature: Widget Embedding:** A standout feature for Pages is the ability to embed **Widgets**. Widgets are complex, reusable content blocks (e.g., contact forms, interactive maps, recent blog post lists, social media feeds, or custom HTML blocks). This allows you to integrate dynamic and specialized functionalities directly into your static pages without needing to write code.
    *   **AI Content Helper:** The integrated AI-assisted writing feature can help you generate new content from scratch, rephrase existing text, summarize lengthy sections, or even suggest improvements based on a prompt you provide. This tool is invaluable for accelerating content creation and refining your messaging.

### Settings Sidebar

The sidebar houses various configurations and metadata settings for your page.

*   ### Publishing & Hierarchy
    *   **Status:** Controls the visibility of your page:
        *   "Draft": The page is saved but not live on the website.
        *   "Published": The page is live and accessible to visitors.
    *   **Slug:** This defines the URL path for your page. For example, a slug of `about-us` would result in a URL like `yourwebsite.com/about-us`. It should be unique and descriptive.
    *   **Parent Page:** **This is a crucial feature for structuring your site.** The dropdown allows you to select an existing page to be the parent of the current page. This creates a nested URL structure (e.g., if "About Us" is the parent of "Our Team," the URL might be `yourwebsite.com/about-us/our-team`). This hierarchical relationship is vital for generating breadcrumbs, organizing your sitemap, and improving user navigation.

*   ### Organization & Features
    *   **Template:** A dropdown menu to select a specific layout template for your page. Different templates can offer varying visual designs and structural elements (e.g., a full-width template, a sidebar template, a landing page template).
    *   **Categories:** A checklist allowing you to assign the page to one or more predefined categories. This helps in organizing content and can be used for filtering or displaying related pages.
    *   **Enable Feedback:** A checkbox to activate or deactivate the feedback or commenting functionality specifically for this page.
    *   **Attach Payment Method:** A dropdown to link the page to a specific payment method. This is particularly useful for pages designed to initiate a transaction or collect payments directly.

*   ### Featured Content
    *   **Featured Image:** Allows you to upload or select an image that represents the page, often used in listings, social media shares, or as a banner image.
    *   **Featured Slider:** Similar to embedding sliders in the content, this option typically places a slider in a prominent, predefined area of the page's template (e.g., at the top of the page).

*   ### SEO
    *   **SEO Title:** The title that appears in browser tabs and search engine results. Optimize this for keywords.
    *   **SEO Description:** A brief summary of the page's content, also displayed in search engine results.
    *   **SEO Keywords:** Relevant keywords that help search engines understand the page's topic (though less impactful for ranking than title and description).

## 4. Previewing and Saving

*   **Preview Button:** While editing, you can click the "Preview" button to see a live rendition of your page within a modal window. This allows you to review your changes instantly without leaving the editor, ensuring the content appears as intended before publishing.
*   **Save Button:** After making your desired changes, click the "Save" button to commit them. If the page status is "Published," your changes will go live immediately. If it's a "Draft," the changes will be saved but remain unpublished.