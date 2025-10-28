FocusWord is a next-generation, open-source Content Management System (CMS) built with Next.js 14, React 18, and TypeScript. Inspired by the flexibility and extensibility of WordPress, FocusWord brings a modern developer experience, robust security, and a smooth user interface to the world of website management.
Why FocusWord?

While WordPress remains a staple in the CMS world, it often feels outdated for modern JavaScript developers. FocusWord aims to provide a familiar yet forward-thinking alternative, leveraging the latest web technologies for speed, security, and extensibility.
Architecture Overview


    Frontend: Next.js 14 with App Router, React 18, TypeScript, @tanstack/react-query.
    Backend: RESTful API endpoints (e.g., /api/auth/login), JWT authentication, Docker support.
    State Management: React Query for data fetching and caching.
    Validation: Zod for both client and server-side schema validation.
    Session Handling: Access tokens in cookies, session expiration logic with localStorage for «Remember me».
Authentication & Authorization

    Login: Secure form with Zod validation, error feedback, and «Remember me» option.
    Session Management:
    If «Remember me» is unchecked, a session_expire_at timestamp is stored in localStorage (1 hour).
    On app load, expired sessions clear tokens and redirect to /signin.
    All tokens are stored in cookies for enhanced security.
    Protected Routes: Admin layout checks for access_token in cookies; unauthorized users are redirected.
