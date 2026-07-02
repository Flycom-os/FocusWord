# Media Files User Guide

## 1. Introduction

The Media Files library is the central hub for managing all media assets used across the website. Here, content managers and administrators can upload, view, organize, and delete images, videos, and audio files, ensuring a streamlined and efficient content creation process.

## 2. Overview of the Interface

Upon navigating to the Media Files section, you will be presented with a grid-based interface designed for easy management of your digital assets. The main screen displays all uploaded media files as individual cards.

Key UI elements include:

*   **Main Title:** "Media Files" - Indicates your current location within the administration panel.
*   **Upload Button:** Typically labeled "Upload File," this button allows you to add new media to your library.
*   **Search Bar:** A text input field to quickly find specific files by name, alt text, or caption.
*   **Filtering Options:** Checkboxes or buttons to filter the displayed media by type (Images, Videos, Audio).
*   **Media Grid:** The main display area where all your media files are shown as interactive cards.

## 3. Uploading Files

To add new media to your library:

1.  Click the **"Upload File"** button. This action will open your operating system's file browser.
2.  Navigate to the location of the file you wish to upload on your computer.
3.  Select the desired file and confirm your selection.
4.  The file will begin uploading automatically.
5.  Once the upload is complete, a "File uploaded successfully" notification will appear, and the newly added file will be visible in the media grid.

## 4. Viewing and Finding Files

### Grid View

All media files are displayed as cards within a responsive grid.

*   **Image Files:** For image files, a thumbnail preview of the image is shown directly on the card, allowing for quick visual identification.
*   **Non-Image Files:** For videos, audio, or other document types, a placeholder icon or text (e.g., "video/mp4", "audio/mpeg") will be displayed on the card, indicating the file type. Each card prominently displays the filename.

### Searching

The **search bar** at the top of the interface allows you to efficiently locate specific media files.

*   Type a **filename**, **alt text**, or **caption** into the search bar.
*   The system employs a "debounced" search, meaning it waits a brief moment after you stop typing before executing the search query. This optimizes performance by preventing unnecessary searches while you are actively typing.
*   Results will update dynamically as you type, showing only files that match your search criteria.

### Filtering

To narrow down the displayed files by type, use the **filtering options**:

*   **"Images only"**: Check this option to display only image files.
*   **"Videos only"**: Check this option to display only video files.
*   **"Audio only"**: Check this option to display only audio files.
*   You can select multiple filters to combine criteria (e.g., "Images only" and "Videos only").
*   To remove all active filters and view all media files again, click the **"Clear Filters"** button.

## 5. Managing Files

### Deleting a File

To remove a file from your media library:

1.  Locate the card of the file you wish to delete within the media grid.
2.  Click the **"Delete"** button, which is typically found on the file's card.
3.  A confirmation dialog will appear, asking, "Are you sure you want to delete this file?".
4.  If you confirm, the file will be permanently removed from the library and the server. **Please note: This action cannot be undone.**

## 6. File Details (Implicit)

Each file card prominently displays the filename for easy identification. For image files, although not always directly visible on the card, the `altText` (alternative text) associated with the image is crucial. This text is used in the `alt` attribute of `<img>` tags on the website, enhancing both Search Engine Optimization (SEO) and accessibility for users with visual impairments.