# Integration of Sliders, Media, and Pages - Full Documentation

## 🎯 Overview

The system fully integrates the management of sliders, media files, and their insertion into website pages. This allows for the creation of rich multimedia content.

## 🏗️ Architecture

### Backend

#### Data Model (Prisma)

```prisma
model Page {
  // ... core fields
  featuredSlider   Slider? @relation("FeaturedSliderOfPage", fields: [featuredSliderId], references: [id])
  featuredSliderId Int?
  
  // JSON array with metadata about content blocks
  contentBlocks Json? @default("[]")
  // Structure: [{ type: 'slider' | 'media' | 'gallery', id: number, position: number, config?: object }]
}

model Slider {
  // ... core fields
  slides Slide[]
  featuredInPages Page[] @relation("FeaturedSliderOfPage")
}

model Slide {
  // ... core fields
  image   MediaFile? @relation(fields: [imageId], references: [id])
  imageId Int?
}
```

#### API Endpoints

- **Sliders:**
  - `POST /sliders` - create slider
  - `GET /sliders` - get list of sliders
  - `GET /sliders/:id` - get slider by ID
  - `PATCH /sliders/:id` - update slider
  - `DELETE /sliders/:id` - delete slider

- **Slides:**
  - `POST /sliders/:sliderId/slides` - create slide
  - `GET /sliders/:sliderId/slides` - get slider slides
  - `GET /sliders/:sliderId/slides/:slideId` - get slide
  - `PATCH /sliders/:sliderId/slides/:slideId` - update slide
  - `DELETE /sliders/:sliderId/slides/:slideId` - delete slide

- **Pages:**
  - `POST /pages` - create page
  - `GET /pages` - get list of pages
  - `GET /pages/:id` - get page by ID
  - `PATCH /pages/:id` - update page (+ sliders and contentBlocks)
  - `DELETE /pages/:id` - delete page

### Frontend

#### Components

1. **PageSlider** (`shared/ui/PageSlider`)
   - Component for displaying a slider on the page
   - Props:
     - `slider`: slider object with data
     - `autoPlay`: autoplay (default: true)
     - `interval`: autoplay interval in ms (default: 5000)
     - `showArrows`: show navigation arrows (default: true)
     - `showDots`: show indicators (default: true)

2. **Pages Admin View** (`app/ui/admin/pages/pages-admin-view`)
   - Extended interface for page management
   - Supports Featured Slider selection
   - Integrated HTML editor

#### API Integration

**API for pages** (`shared/api/pages.ts`):
```typescript
interface PageDto {
  id: number;
  title: string;
  slug: string;
  content: string;
  status: string;
  featuredSliderId?: number | null;
  contentBlocks?: Array<{
    type: 'slider' | 'media' | 'gallery';
    id: number;
    position?: number;
    config?: Record<string, any>;
  }>;
  featuredSlider?: {
    id: number;
    name: string;
    slug: string;
    slides?: Array<{
      id: number;
      title?: string;
      description?: string;
      linkUrl?: string;
      image?: {
        id: number;
        filename: string;
        filepath: string;
      };
    }>;
  };
  // ... other fields
}
```

## 📖 How to Use

### 1️⃣ Creating a Slider

**Backend:**
```bash
POST /sliders

{
  "name": "Main slider",
  "slug": "main-slider",
  "description": "Main slider for the home page"
}
```

**Frontend (Admin):**
- Go to "Sliders" section
- Click "Add slider"
- Fill in name, slug, and description
- Save

### 2️⃣ Adding Slides with Media

**Backend:**
```bash
POST /sliders/:sliderId/slides

{
  "title": "First slide",
  "description": "Description of the first slide",
  "linkUrl": "https://example.com",
  "sortOrder": 0,
  "imageId": 1  // Media file ID
}
```

**Frontend (Admin):**
- Select a slider from the list
- Click "Add slide"
- Fill in slide information
- Click "Select media" and choose an image from the library
- Save

### 3️⃣ Inserting a Slider into a Page

**Backend:**
```bash
PATCH /pages/:pageId

{
  "title": "My page",
  "slug": "my-page",
  "content": "<h1>Page Content</h1>",
  "featuredSliderId": 1,  // Slider ID
  "contentBlocks": [
    {
      "type": "slider",
      "id": 1,
      "position": 0
    }
  ]
}
```

**Frontend (Admin):**
- Go to "Pages" section
- Create a new or edit an existing one
- In the sidebar, select "Featured Slider"
- Choose the desired slider from the dropdown
- Save

### 4️⃣ Viewing a Page with a Slider (Public)

- Open the page at URL `/pages/my-page`
- The slider will display with autoplay
- The user can:
  - Autoplay every 5 seconds
  - Click on dots to jump to a specific slide
  - Use arrows for manual navigation

## 🚀 Features

### Backend
- ✅ Full support for CRUD operations for sliders and slides
- ✅ Linking slides with media files
- ✅ Linking pages with sliders
- ✅ JSON field `contentBlocks` for extensibility
- ✅ Redis caching for performance
- ✅ Automatic cache invalidation on changes

### Frontend
- ✅ Responsive PageSlider component
- ✅ Autoplay with settings
- ✅ Touch navigation (arrows + dots)
- ✅ Responsive design for mobile devices
- ✅ Image and load optimization
- ✅ Integrated editor for administrator

## 📱 Implementation Details

### Sliders now include media files

When requesting slides, associated media files are included:

```typescript
await this.prisma.slide.findMany({
  where: { ... },
  include: { image: true },  // ✅ Now works!
});
```

### Pages have a relationship with sliders

When retrieving a page, the relevant slider is included:

```typescript
const page = await this.prisma.page.findUnique({
  where: { id },
  include: {
    featuredSlider: {
      include: {
        slides: {
          include: { image: true }
        }
      }
    }
  }
});
```

### PageSlider Component

Reactive display component:

```tsx
<PageSlider 
  slider={page.featuredSlider}
  autoPlay={true}
  interval={5000}
  showArrows={true}
  showDots={true}
/>
```

## 🔄 Workflow: From A to Z

1. **Administrator uploads media:**
   - Goes to "Media Files"
   - Uploads images
   - Adds alt text and captions

2. **Administrator creates a slider:**
   - Creates a new slider "Main Banner"
   - Adds slides
   - For each slide, selects an uploaded image
   - Adds title, description, link
   - Sets sort order

3. **Administrator creates a page:**
   - Creates a new page "About Us"
   - Writes content in the HTML editor
   - In the sidebar, selects "Main Banner" as Featured Slider
   - Saves the page

4. **User views the page:**
   - Opens URL `/pages/about`
   - Sees page title
   - Sees slider with autoplay
   - Can click on arrows or dots for navigation
   - Sees remaining content below the slider

## 🛠️ Extension

### Adding new content types

To add a new content type (e.g., video gallery):

1. **Backend:**
   - Create a new model in Prisma
   - Add relationship with Page
   - Add new controller and service

2. **Frontend:**
   - Create a new component (e.g., `PageVideoGallery`)
   - Add selection field in admin interface
   - Update API types

3. **contentBlocks:**
   ```json
   {
     "type": "video-gallery",
     "id": 1,
     "position": 1,
     "config": { "columns": 3 }
   }
   ```

## 📊 Performance

- **Caching:** Redis cache for all requests
- **Images:** Size optimization through media data verification
- **Lazy Loading:** Component supports lazy loading
- **SSR/SSG:** Pages are ready for enhanced generation

## ✅ Testing

### Test media preview in sliders:

1. Create slider → Add slide → Select media
2. Verify that the image appears in the slides table
3. Confirmation: ✅ Preview works

### Test slider insertion into page:

1. Create page → Select slider in dropdown
2. Open page publicly
3. Verify that the slider is displayed and navigation works

## 🎨 Style Customization

The `PageSlider.module.css` file contains all component styles. Easily change:
- Sizes and proportions
- Colors and transparency
- Animations and transitions
- Responsiveness for different screen sizes

---

**Version:** 1.0.0  
**Update Date:** April 2026  
**Status:** ✅ Fully Integrated
