# Sliders Module User Guide

## 1. Introduction

The Sliders module is a powerful tool designed for website administrators and content managers to create, manage, and organize dynamic collections of slides. These slides, which can consist of images, text, and links, are primarily used to build engaging slideshows and carousels that can be displayed across various sections of your website.

## 2. The Main Sliders Page (`/admin/sliders`)

This page serves as your central dashboard for overseeing all existing sliders within your application.

Upon navigating to `/admin/sliders`, you will see:

*   **List of Sliders:** A comprehensive list displaying all sliders that have been created.
*   **Actions for Each Slider:** For every slider listed, you will find options to:
    *   **Edit:** Click the "Edit" button to modify the slider's details and manage its individual slides.
    *   **Delete:** Click the "Delete" button to permanently remove the slider and all its associated slides. (Note: This action typically requires a confirmation step to prevent accidental deletion.)
*   **Create New Slider Button:** A prominent button, usually labeled "Create New Slider" or similar, which allows you to initiate the creation process for a brand-new slider.

## 3. Creating a New Slider

To create a new slider, click the "Create New Slider" button on the main sliders page. This will take you to a form where you'll define the basic properties of your new slider.

You will need to provide the following information:

*   **Name:** This is an internal name for your slider (e.g., "Homepage Banner," "Product Showcase Carousel"). It helps you identify the slider within the admin panel.
*   **Slug:** A URL-friendly identifier for the slider (e.g., "homepage-banner," "product-carousel"). The system uses this slug to know where on the website to display this specific slider. It should be unique and ideally descriptive.
*   **Description:** An optional internal note or remark about the slider's purpose, usage, or any other relevant information for internal reference.

## 4. Editing a Slider and Managing Slides (`/admin/sliders/edit/[id]`)

This page is the core of the Sliders module, allowing you to fine-tune a specific slider and control the content and arrangement of its individual slides. You can access this page by clicking "Edit" next to a slider on the main `/admin/sliders` page.

### Slider Details

At the top of this page, you can update the fundamental details of the slider you are currently editing:

*   **Name:** Modify the internal name of the slider.
*   **Slug:** Adjust the URL-friendly identifier. Be cautious when changing this, as it might affect where the slider is displayed on the website.
*   **Description:** Update the internal notes for the slider.

### Slides Section

Below the slider details, you will find the section dedicated to managing the individual slides that make up your slider.

*   **Adding a Slide:** Click the "Add Slide" button to append a new, empty slide card to the editor. You can then populate this card with content.
*   **Removing a Slide:** Each slide card includes a "Remove" button (often represented by a trash can icon). Clicking this will delete that specific slide from the current slider.
*   **Slide Content:** For each slide card, you can configure the following elements:
    *   **Media File (Image):** This is the primary visual element of your slide. Click the "Select" or "Choose" button to open the **Media Library**. Here, you can:
        *   Browse and select an existing image that has already been uploaded to your system.
        *   Upload a new image directly from your computer.
        Once an image is selected, a thumbnail preview will appear on the slide card.
    *   **Caption/Title:** A text field where you can enter the main heading or title for your slide.
    *   **Description:** A text field for a subheading, a brief paragraph, or any additional descriptive text for the slide.
    *   **Link URL:** If your slide should be clickable, enter the full URL (e.g., `https://www.example.com/product-page`) in this field. When users click on the slide, they will be directed to this URL.
*   **Reordering Slides:** The order in which slides appear on your website directly corresponds to their arrangement on this editing page. You can change the order of slides, typically by dragging and dropping slide cards into your desired sequence or by adjusting a "sortOrder" number if available. Ensure the slides are in the correct visual order for your website's presentation.

## 5. Saving and Deleting

### Saving Changes

After making any modifications to a slider's details or its slides, you **must** click the "Save Changes" button. Failure to do so will result in the loss of your unsaved work if you navigate away from the page.

### Deleting a Slider

As mentioned in section 2, you can delete a slider from the main `/admin/sliders` page. When you click the "Delete" button next to a slider, you will typically be prompted with a confirmation message. Confirming this action will permanently remove the slider and all its associated individual slides from the system. This action cannot be undone, so exercise caution.