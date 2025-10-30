# FocusWord CMS (Frontend)

**FocusWord** is a modern open-source CMS inspired by WordPress, built with Next.js 14, React 18, and TypeScript. The project is designed for fast content creation, management, and publishing with a convenient admin panel and extensible architecture.

---

## Features

- **Modern stack:** Next.js 14, React 18, TypeScript, Zustand, React Query, Zod.
- **App Router:** Uses the new file-based routing of Next.js.
- **Modular architecture:** Separation into widgets, features, entities, shared.
- **Responsive design:** Sidebar with animation, modern UI.
- **Storybook:** For component development and testing.
- **Testing:** Unit test coverage with Jest and Testing Library.
- **Linting and formatting:** ESLint, Prettier, Stylelint.
- **Localization:** Russian and English (easily extendable).
- **WordPress alternative:** Familiar structure for WP users, but on a modern frontend.

---

## Quick Start

```bash
git clone https://github.com/your-org/focusword-frontend.git
cd focusword-frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Scripts

- `npm run dev` — start in development mode
- `npm run build` — production build
- `npm run start` — run production server
- `npm run lint` — run linter
- `npm run test` — run tests
- `npm run storybook` — run Storybook

---

## Project Structure

```
├── app/                # Next.js App Router (pages, layout)
├── src/
│   ├── app/            # Global components, styles, layout
│   ├── widgets/        # Widgets (sidebar, header, search, etc.)
│   ├── features/       # Features (logic, forms, filters)
│   ├── entities/       # Entities (user, post, media, etc.)
│   ├── shared/         # Reusable components and utilities
│   └── public/         # SVG, images, icons
├── public/             # favicon, static files
├── package.json
├── tsconfig.json
└── ...
```

---

## Technologies

- **Next.js 14**
- **React 18**
- **TypeScript**
- **Zustand** (state management)
- **React Query** (data fetching)
- **Jest, Testing Library** (testing)
- **Storybook** (UI documentation)
- **ESLint, Prettier, Stylelint** (code quality)
- **Lucide-react** (icons)

---

## Contribution & License

This project is licensed under the MIT License.  
PRs and ideas are welcome!

---

## WordPress Alternative

- **FocusWord** is a modern alternative to WordPress, but built with React/Next.js.
- Familiar structure: posts, pages, media, categories, users, settings.
- Modern UI and DX for developers.

---

## Contacts

- 
- 