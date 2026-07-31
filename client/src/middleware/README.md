# Middleware for Access Permissions Verification

This middleware provides route protection based on user access permissions.

## How it works

1. **Middleware** intercepts all requests to the admin panel pages.
2. **Checks the route** based on the configuration in `routes.ts`.
3. **Verifies the user's permissions** through the API endpoint `/api/auth/check-permissions`.
4. **Redirects** to the access denied page if permissions are insufficient.

## File Structure

```
src/middleware/
├── middleware.ts          # Main middleware
├── routes.ts             # Routes configuration
└── README.md             # Documentation

src/app/api/auth/check-permissions/
└── route.ts              # API endpoint for checking permissions

src/app/ui/
└── access-denied.tsx     # Access denied page component

src/app/admin/access-denied/
└── page.ts              # Access denied page
```

## Route Configuration

In `routes.ts`, you can configure protected routes:

```typescript
export const protectedRoutes: Record<string, RouteConfig> = {
  '/admin/media-files': { resource: 'media-files', minLevel: 0 },
  '/admin/users': { resource: 'users', minLevel: 1 },
  '/admin/roles': { resource: 'roles', minLevel: 2 },
};
```

## Access Levels

- **Level 0**: Read-only
- **Level 1**: Read and update
- **Level 2**: Full access, including deletion

## Public Routes

These routes do not require permissions verification:

```typescript
export const publicRoutes = [
  '/',
  '/admin/login',
  '/admin/profile',
  '/admin/settings',
  '/admin/access-denied',
];
```

## API Endpoint

`POST /api/auth/check-permissions`

Request body:
```json
{
  "resource": "media-files",
  "minLevel": 1
}
```

Headers:
```
Authorization: Bearer <token>
```

Response:
```json
{
  "hasPermission": true,
  "userPermissionLevel": 2,
  "requiredLevel": 1,
  "userId": "1"
}
```

## Installation and Setup

1. **Install jsonwebtoken** (when npm is available):
   ```bash
   npm install jsonwebtoken @types/jsonwebtoken
   ```

2. **Configure JWT_SECRET** in environment variables.

3. **Replace the stub** in `check-permissions/route.ts` with real JWT verification.

4. **Configure permissions** according to your authorization system.

## Testing

For testing, you can use mock tokens:
- `mock-admin-token` - user with full permissions (userId: 1)
- `mock-user-token` - user with limited permissions (userId: 2)

## Security

- Middleware runs on the server before the page loads.
- All permission checks happen before components render.
- Invalid tokens are blocked at the middleware level.
- Public routes are excluded from verification checks.
