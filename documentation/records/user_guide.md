# User Guide: Managing Records

This guide provides a comprehensive overview of how to create, manage, and organize content using the "Records" module in your application's admin panel.

## Part 1: Managing Records

### 1. Introduction to Records

"Records" are a flexible and powerful content type, similar to articles, blog posts, or pages. They are designed for creating structured and engaging content for your website. Each record is a standalone piece of content that includes:

*   A **Title** and main **Content**.
*   **SEO settings** to optimize for search engines.
*   The ability to be assigned to one or more **Categories**.
*   Support for rich media like **Featured Images** and embedded **Sliders**.

You can use Records to build a wide variety of content, from news updates and case studies to detailed informational pages.

### 2. The Main Records Page

The main Records management page, accessible via the `/admin/records` URL, is your central hub for all records.

`[Screenshot of the main Records page]`

**Key Features:**

*   **Records List:** A comprehensive table or grid view displays all existing records. By default, it shows key information for each record, such as its **Title**, **Status** (e.g., "Published" or "Draft"), **Author**, and key **Dates** (like creation or last modification date).
*   **Create New Record:** A prominent **Create New Record** or **Create Draft** button allows you to start creating a new piece of content.
*   **Record Actions:** For each record in the list, you have several actions available:
    *   **Edit:** Opens the record in the editor to make changes.
    *   **Delete:** Permanently removes the record. A confirmation will be required.
    *   **View:** (If available) A quick link to see the live record on the public website.
*   **Search and Filtering:**
    *   Use the **search bar** to quickly find a record by its title or keywords in its content.
    *   Use the **filter dropdowns** to narrow down the list by **Status** (e.g., show only "Draft" records).

### 3. Creating and Editing Records

The record editor is where you bring your content to life. It is accessed by clicking **Create New Record** or the **Edit** button for an existing record (`/admin/records/create` or `/admin/records/edit/[id]`). The editor features a two-column layout for an efficient workflow.

`[Screenshot of the record editor, showing the two-column layout]`

#### Main Content Column (Left)

This is where you'll spend most of your time crafting the body of your record.

*   **Title:** Enter the main title for your record here. This is typically displayed as the primary heading on the page.

*   **Content Editor:** The core of the editor is a modern, block-based panel where you can write your text. Beyond standard text formatting, the editor has powerful features for embedding media and leveraging AI.

    *   **Adding Media:**
        1.  Click the **Add Media** button within the editor's toolbar.
        2.  This will open the **Media Library** (`MediaPickerModal`).
        3.  From here, you can either select an existing image or upload a new one.
        4.  Once selected, the image will be inserted directly into your content.

    *   **Adding Sliders:**
        1.  Click the **Add Slider** button.
        2.  A modal will appear, listing all pre-made Sliders.
        3.  Select the slider you wish to embed. It will be placed into the content as a special block.

    *   **AI Content Helper:** This powerful feature helps you generate and refine your content. To use it:
        1.  Highlight a piece of text you want to modify, or place your cursor where you want new content.
        2.  Click the **AI Complete** (or similarly named) button.
        3.  A prompt box will appear. You can enter commands like:
            *   _"Rewrite this paragraph to be more formal."_
            *   _"Summarize the selected text."_
            *   _"Write a conclusion for this article about marketing trends."_
        4.  The AI will process your request and replace or insert the generated content directly into the editor.

#### Settings Sidebar (Right)

The right-hand sidebar contains all the metadata and configuration options for the record.

*   **Publishing:**
    *   **Status:** Use this dropdown to control the visibility of the record.
        *   **Published:** The record is live and visible on your website.
        *   **Draft:** The record is saved but not visible to the public.
    *   **Slug:** This defines the URL for your record (e.g., `yourwebsite.com/records/your-custom-slug`). It is often auto-generated from the title, but you can click to edit it for a cleaner, more descriptive URL.

*   **Organization:**
    *   **Categories:** This section displays a checklist of all available **Record Categories**. Check the boxes for any categories you want to assign this record to.
    *   **Template:** (If available) Select a visual template from the dropdown to change how the record is displayed on the front end.

*   **Featured Content:**
    *   **Featured Image:** Click to open the Media Library and select an image that will serve as the primary thumbnail or banner for the record. This image is often used on listing pages and when sharing on social media.
    *   **Featured Slider:** Similar to the featured image, you can select a pre-made Slider to be displayed prominently at the top of the record's page. A mini-preview of the selected slider will be shown here so you can see what you've chosen.

*   **SEO:**
    Optimize your record for search engines by filling out these fields.
    *   **SEO Title:** The title that will appear in search engine results and browser tabs. If left blank, the main record title is often used.
    *   **SEO Description:** A brief summary of the page content for search engine results.
    *   **Meta Keywords:** A comma-separated list of relevant keywords.

### 4. Previewing and Saving

*   **Preview:** Before publishing, you can see exactly how your record will look by clicking the **Preview** button. This opens a modal window (`RecordPreviewModal`) that renders a live, interactive preview of the record without you having to save your changes first.
*   **Saving:** Once you are satisfied with your content and settings, click the **Save** or **Create** button to save all your work.

---

## Part 2: Managing Record Categories

### 1. Introduction to Record Categories

Categories are the primary way to group and organize your records. By assigning records to categories like "News," "Case Studies," or "Events," you create a more structured and navigable website for your visitors. They can be used to create dedicated pages that list all records from a specific category.

### 2. The Categories Page

This page, located at `/admin/records/categories`, is where you manage all your categories.

`[Screenshot of the Record Categories page]`

*   The page displays a list of all existing categories.
*   A **search bar** is available to quickly find a specific category by name.
*   The **Create Category** button is used to add a new category.

### 3. Creating and Editing Categories

Clicking **Create Category** or editing an existing one will open a modal dialog with the following fields:

`[Screenshot of the 'Create Category' modal]`

*   **Name:** The display name for the category (e.g., "Company News"). This is what visitors will see.
*   **Slug:** The URL-friendly version of the name (e.g., "company-news"). This is typically generated automatically but can be edited.
*   **Description:** An optional field where you can add a short description for the category. This might be displayed on the category's archive page.
*   **Parent Category:** (If your site supports nested categories) You can select an existing category here to create a hierarchical structure (e.g., "Press Releases" could be a child category of "News").

### 4. Deleting Categories

You can delete a category by clicking the `Delete` icon next to it in the list.

**Important:** Be cautious when deleting a category. Deleting a category does not delete the records within it. Instead, it simply removes the association, leaving those records uncategorized.
