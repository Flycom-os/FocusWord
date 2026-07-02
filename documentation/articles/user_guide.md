# Articles Module User Guide

## 1. Introduction to Articles

The Articles module is designed for managing dynamic, chronological content such as blog posts, news updates, and informational articles. If you are already familiar with how to create and manage **Pages** or **Records** within the system, you will find the process for Articles very intuitive and familiar, as it shares many common functionalities and UI patterns.

## 2. The Main Articles Page (`/admin/articles`)

The main Articles page provides a comprehensive list view of all articles created in the system. From here, you can perform various actions to manage your content effectively.

*   **List View:** Displays a table of all articles, typically showing key information such as **Title**, **Author**, **Status**, **Categories**, and **Last Updated** date.
*   **Standard Actions:**
    *   **Create Article:** A prominent button, usually located at the top of the page, to begin composing a new article.
    *   **Edit:** Click the **Edit** button (often represented by a pencil icon) next to an article's entry to modify its content or settings.
    *   **Delete:** Use the **Delete** button (often a trash can icon) to remove an article from the system. A confirmation prompt will usually appear to prevent accidental deletions.
    *   **View:** The **View** button allows you to see how the article appears on the public-facing website.
*   **Filtering and Searching:** The page includes tools to help you quickly find specific articles. You can typically filter by **Status** (e.g., Draft, Published), **Category**, or use a search bar to find articles by **Title** or **Keyword**.

## 3. Creating and Editing Articles

The Article editor page is a two-column interface designed for efficient content creation and management.

### Main Content Column

This is where you compose the primary content of your article.

*   **Title:** Enter the main title of your article here. This will be prominently displayed on the article page and often used in search results.
*   **Excerpt:** Provide a short summary or teaser of the article's content. This excerpt is often used in article listings, social media shares, or search engine results to give readers a preview.
*   **Content Editor:** This powerful, block-based editor is identical to the one used for **Pages** and **Records**. It allows for rich text formatting (bold, italics, headings, lists, etc.), embedding of **Media** (images, videos, audio files), and integration of **Sliders** to create engaging and visually appealing content.

### Settings Sidebar

The right-hand sidebar contains various settings and options to configure your article's behavior and presentation.

*   **Publishing:**
    *   **Status:** Control the visibility of your article.
        *   **Draft:** The article is saved but not visible to the public. It can be further edited.
        *   **Published:** The article is live and accessible to your audience.
    *   **Slug:** This automatically generated, user-friendly URL segment (e.g., `your-article-title`) makes your article accessible on the web. You can usually edit this to optimize it for SEO or readability.
*   **Organization & Features:**
    *   **Template:** Select a pre-defined layout or design template for your article from a dropdown menu. This allows you to customize the article's appearance without coding.
    *   **Categories:** Assign your article to one or more categories using a checklist. Categories help organize your content and make it easier for users to browse related articles.
    *   **Enable Feedback:** A checkbox that allows you to enable or disable the commenting functionality for this specific article, giving readers a platform to interact.
    *   **Attach Payment Method:** A dropdown menu that enables you to link a payment method to the article, potentially making it paid content or part of a subscription.
*   **Featured Content:**
    *   **Featured Image:** Select a main image that visually represents your article. This image is often displayed in article listings, social media shares, and at the top of the article itself.
    *   **Featured Slider:** Choose a pre-configured slider to display at the top of your article page, ideal for showcasing multiple images or promotions.
*   **SEO (Search Engine Optimization):**
    *   **SEO Title:** Customize the title that appears in search engine results and browser tabs.
    *   **SEO Description:** Write a concise summary of your article for search engine results.
    *   **SEO Keywords:** Provide relevant keywords to help search engines understand your content.

## 4. Key Differences from Other Content Types

While Articles share many similarities with other content types, there are distinct differences that cater to their specific purpose:

*   **vs. Pages:**
    *   **Chronological Feed:** Articles are primarily designed to be displayed in a reverse chronological feed (like a blog), whereas **Pages** are typically static, standalone content.
    *   **Hierarchy:** Articles generally do not have a parent-child hierarchy, unlike **Pages**, which can be nested.
*   **vs. Records:**
    *   **Excerpt Field:** Articles have a dedicated **Excerpt** field for concise summaries, which may not be available on all **Records**.
    *   **Built-in Features:** Articles can natively support features like **Enable Feedback** (comments) and **Attach Payment Method**, which might require custom implementations or integrations for **Records**.