# API Documentation - Flower Shop

## Users (User API)

### Get information about the current user
```
GET /user/me
Authorization: Bearer <token>
```
Returns complete user information including cart, orders, comments, and addresses.

### Get all users with search
```
GET /user/all?name=John&page=0&limit=10
Authorization: Bearer <token>
```
Parameters:
- `name` (optional) - search by first name, last name, or email
- `page` (optional) - page number (default 0)
- `limit` (optional) - number of items per page (default 10)

### Update current user data
```
PATCH /user/me
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "name": "New Name",
  "surname": "New Surname",
  "email": "new@example.com",
  "face": <image file>
}
```

### Delete current user
```
DELETE /user/me
Authorization: Bearer <token>
```

### Get user by ID
```
GET /user/:id
Authorization: Bearer <token>
```

### Update user by ID
```
PATCH /user/:id
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

### Delete user by ID
```
DELETE /user/:id
Authorization: Bearer <token>
```

## Cart (Cart API)

### Get user's cart
```
GET /cart
Authorization: Bearer <token>
```

### Add item to cart
```
POST /cart/add
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": 1,
  "quantity": 2
}
```

### Update item quantity in cart
```
PATCH /cart/item/:itemId
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 3
}
```

### Remove item from cart
```
DELETE /cart/item/:itemId
Authorization: Bearer <token>
```

### Clear cart
```
DELETE /cart/clear
Authorization: Bearer <token>
```

## Orders (Orders API)

### Create a new order
```
POST /orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "address": "1 Pushkina St.",
  "date_delivery": "2024-01-15",
  "total_service": "1000",
  "items": [
    {
      "productId": 1,
      "quantity": 2
    },
    {
      "productId": 3,
      "quantity": 1
    }
  ]
}
```

### Get orders with filtering
```
GET /orders?userId=1&status=pending&page=0&limit=10
Authorization: Bearer <token>
```
Parameters:
- `userId` (optional) - filter by user
- `status` (optional) - filter by order status
- `page` (optional) - page number
- `limit` (optional) - number of items per page

### Get current user's orders
```
GET /orders/my?status=pending&page=0&limit=10
Authorization: Bearer <token>
```

### Get order by ID
```
GET /orders/:id
Authorization: Bearer <token>
```

### Update an order
```
PATCH /orders/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "processing",
  "address": "New Address",
  "date_delivery": "2024-01-20",
  "total_service": "1200"
}
```

### Delete an order
```
DELETE /orders/:id
Authorization: Bearer <token>
```

## Addresses (Address API)

### Create a new address
```
POST /address
Authorization: Bearer <token>
Content-Type: application/json

{
  "address": "1 Pushkina St., Apt. 10"
}
```

### Get addresses with filtering
```
GET /address?userId=1&page=0&limit=10
Authorization: Bearer <token>
```
Parameters:
- `userId` (optional) - filter by user
- `page` (optional) - page number
- `limit` (optional) - number of items per page

### Get current user's addresses
```
GET /address/my?page=0&limit=10
Authorization: Bearer <token>
```

### Get address by ID
```
GET /address/:id
Authorization: Bearer <token>
```

### Update an address
```
PATCH /address/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "address": "5 Lenina St., Apt. 20"
}
```

### Delete an address
```
DELETE /address/:id
Authorization: Bearer <token>
```

## Order Statuses

- `pending` - awaiting processing
- `processing` - in process
- `shipped` - shipped
- `delivered` - delivered
- `cancelled` - cancelled

## API Responses

### Successful Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error
```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400
}
```

### Pagination
```json
{
  "data": [...],
  "total": 100,
  "page": 0,
  "limit": 10,
  "totalPages": 10
}
```

## Authentication

All APIs (except authentication) require a JWT token in the header:
```
Authorization: Bearer <your-jwt-token>
```

## File Upload

To upload images, use `multipart/form-data` with the `face` field.
