# API Documentation

Complete API documentation for Kiosk AI Backend.

## Table of Contents

1. [Admin APIs](#admin-apis)
2. [Stripe Settings APIs](#stripe-settings-apis)
3. [Authentication](#authentication)
4. [Error Handling](#error-handling)

---

## Admin APIs

### Admin Login

**Endpoint:** `POST /api/admin/login`

**Description:** Authenticate admin user and receive JWT token

**Access:** Public

**Request Body:**
```json
{
  "email": "admin12@gmail.com",
  "password": "admin123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Admin logged in successfully",
  "data": {
    "jwtToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "first_name": "Admin",
      "last_name": "User",
      "email": "admin12@gmail.com"
    }
  }
}
```

**Error Responses:**
- `400` - Email and password are required
- `401` - Invalid email or password
- `500` - Internal server error

---

### Get Dashboard Statistics

**Endpoint:** `GET /api/admin/dashboard/stats`

**Description:** Retrieve dashboard statistics including total orders, payments, and order status counts

**Access:** Private (Admin - Bearer Token Required)

**Headers:**
```
Authorization: Bearer {jwtToken}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Dashboard stats retrieved",
  "data": {
    "totalOrders": 150,
    "totalPayments": 12500,
    "pendingOrders": 25,
    "completedOrders": 125
  }
}
```

**Error Responses:**
- `401` - Unauthorized (missing or invalid token)
- `500` - Internal server error

---

### Update Admin Profile

**Endpoint:** `PUT /api/admin/settings/profile`

**Description:** Update admin user profile information (first name, last name, email)

**Access:** Private (Admin - Bearer Token Required)

**Headers:**
```
Authorization: Bearer {jwtToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "admin@example.com"
}
```

**Note:** All fields are optional. Only include fields you want to update.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "first_name": "John",
      "last_name": "Doe",
      "email": "admin@example.com"
    }
  }
}
```

**Error Responses:**
- `400` - Email already in use
- `401` - Unauthorized
- `404` - User not found
- `500` - Internal server error

---

### Change Admin Password

**Endpoint:** `PUT /api/admin/settings/password`

**Description:** Change admin user password with current password verification

**Access:** Private (Admin - Bearer Token Required)

**Headers:**
```
Authorization: Bearer {jwtToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

**Password Requirements:**
- Minimum 6 characters
- Must contain at least one uppercase letter
- Must contain at least one special character (@#$%^&+!=)
- Must contain at least one number

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": {}
}
```

**Error Responses:**
- `400` - Current password is incorrect / Password too short / Passwords do not match
- `401` - Unauthorized
- `404` - User not found
- `500` - Internal server error

---

### Update Site Settings

**Endpoint:** `PUT /api/admin/settings/site`

**Description:** Update site-wide settings such as site name and URL

**Access:** Private (Admin - Bearer Token Required)

**Headers:**
```
Authorization: Bearer {jwtToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "siteName": "My Kiosk Store",
  "siteUrl": "https://example.com"
}
```

**Note:** All fields are optional. Only include fields you want to update.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Site settings updated successfully",
  "data": {
    "siteName": "My Kiosk Store",
    "siteUrl": "https://example.com"
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `500` - Internal server error

---

### Get Orders List

**Endpoint:** `GET /api/admin/orders`

**Description:** Retrieve list of orders with optional filtering by status and search

**Access:** Private (Admin - Bearer Token Required)

**Headers:**
```
Authorization: Bearer {jwtToken}
```

**Query Parameters:**
- `status` (optional) - Filter by order status: `all`, `pending`, `processing`, `completed`, `cancelled` (default: `all`)
- `search` (optional) - Search by order number, customer name, or email

**Example Request:**
```
GET /api/admin/orders?status=pending&search=john
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Orders retrieved",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "orderNumber": "ORD-001",
      "customerName": "John Doe",
      "customerEmail": "john@example.com",
      "totalAmount": 49.99,
      "status": "pending",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "items": [
        {
          "productName": "Custom T-Shirt",
          "quantity": 1,
          "price": 49.99
        }
      ]
    }
  ]
}
```

**Error Responses:**
- `401` - Unauthorized
- `500` - Internal server error

---

### Get Order Details

**Endpoint:** `GET /api/admin/orders/:id`

**Description:** Retrieve detailed information about a specific order

**Access:** Private (Admin - Bearer Token Required)

**Headers:**
```
Authorization: Bearer {jwtToken}
```

**URL Parameters:**
- `id` (required) - Order ID

**Example Request:**
```
GET /api/admin/orders/507f1f77bcf86cd799439011
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Order details retrieved",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "orderNumber": "ORD-001",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "totalAmount": 49.99,
    "status": "pending",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "items": [
      {
        "productName": "Custom T-Shirt",
        "quantity": 1,
        "price": 49.99
      }
    ],
    "shippingAddress": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zip": "10001",
      "country": "USA"
    }
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Order not found
- `500` - Internal server error

---

## Stripe Settings APIs

### Get Stripe Settings

**Endpoint:** `GET /api/admin/stripe-settings`

**Description:** Retrieve current Stripe payment settings (keys are masked for security)

**Access:** Private (Admin - Bearer Token Required)

**Headers:**
```
Authorization: Bearer {jwtToken}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Stripe settings retrieved",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "publishableKey": "pk_test_...",
    "secretKey": "sk_test_****1234",
    "webhookSecret": "whsec_****5678",
    "isActive": true,
    "currency": "USD",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Note:** Secret keys are masked - only last 4 characters are visible.

**Error Responses:**
- `401` - Unauthorized
- `500` - Internal server error

---

### Update Stripe Settings

**Endpoint:** `PUT /api/admin/stripe-settings`

**Description:** Update Stripe payment settings including API keys, webhook secret, and activation status

**Access:** Private (Admin - Bearer Token Required)

**Headers:**
```
Authorization: Bearer {jwtToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "publishableKey": "pk_test_...",
  "secretKey": "sk_test_...",
  "webhookSecret": "whsec_...",
  "isActive": true,
  "currency": "USD"
}
```

**Note:** All fields are optional. Only include fields you want to update.

**Key Format Validation:**
- `publishableKey` must start with `pk_test_` or `pk_live_`
- `secretKey` must start with `sk_test_` or `sk_live_`
- `webhookSecret` must start with `whsec_`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Stripe settings updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "publishableKey": "pk_test_...",
    "secretKey": "sk_test_****1234",
    "webhookSecret": "whsec_****5678",
    "isActive": true,
    "currency": "USD",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Invalid key format
- `401` - Unauthorized
- `500` - Internal server error

---

### Test Stripe Connection

**Endpoint:** `POST /api/admin/stripe-settings/test`

**Description:** Test the Stripe API connection using the configured secret key

**Access:** Private (Admin - Bearer Token Required)

**Headers:**
```
Authorization: Bearer {jwtToken}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Stripe connection test successful",
  "data": {
    "connected": true,
    "accountId": "acct_...",
    "accountEmail": "account@example.com"
  }
}
```

**Error Responses:**
- `400` - Invalid Stripe key or connection failed
- `401` - Unauthorized
- `500` - Internal server error

---

## Authentication

### Bearer Token Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer {jwtToken}
```

### Getting a Token

1. Call `POST /api/admin/login` with admin credentials
2. Extract the `jwtToken` from the response
3. Include it in subsequent requests as shown above

### Token Expiration

- Tokens expire after 7 days
- If a token expires, you'll receive a `401 Unauthorized` response
- Re-authenticate using the login endpoint to get a new token

---

## Error Handling

### Standard Error Response Format

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

### HTTP Status Codes

- `200` - Success
- `400` - Bad Request (validation errors, invalid input)
- `401` - Unauthorized (missing or invalid token)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

### Common Error Scenarios

**Missing Authorization Header:**
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

**Invalid Token:**
```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

**Validation Error:**
```json
{
  "success": false,
  "error": "Email and password are required"
}
```

**Resource Not Found:**
```json
{
  "success": false,
  "error": "User not found"
}
```

---

## Base URL

**Development:**
```
http://localhost:5000
```

**Production:**
```
https://your-production-domain.com
```

---

## Rate Limiting

Currently, there are no rate limits implemented. This may be added in future versions.

---

## Support

For API support or questions, please contact the development team.

---

## Changelog

### Version 1.0.0 (Current)
- Initial API release
- Admin authentication endpoints
- Dashboard statistics endpoint
- Profile and settings management
- Order management endpoints
- Stripe payment settings management

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- All monetary values are in the smallest currency unit (e.g., cents for USD)
- Secret keys are automatically masked in responses for security
- The admin user is auto-created on first login with credentials: `admin12@gmail.com` / `admin123`
