# Admin Login API - Postman Test Guide

## Endpoint: Admin Login

**Method:** `POST`  
**URL:** `http://localhost:5000/api/admin/login`  
**Content-Type:** `application/json`

### Request Body

```json
{
  "email": "admin12@gmail.com",
  "password": "admin123"
}
```

### Expected Success Response (200)

```json
{
  "success": true,
  "message": "Admin logged in successfully",
  "timestamp": "2024-01-15T10:30:00.000Z",
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

### Expected Error Responses

#### Missing Fields (400)
```json
{
  "success": false,
  "message": "Email and password are required"
}
```

#### Invalid Credentials (401)
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

#### Server Error (500)
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Postman Setup Steps

1. **Create New Request**
   - Method: `POST`
   - URL: `http://localhost:5000/api/admin/login`

2. **Set Headers**
   - `Content-Type`: `application/json`

3. **Set Body**
   - Select "raw"
   - Select "JSON"
   - Paste:
   ```json
   {
     "email": "admin12@gmail.com",
     "password": "admin123"
   }
   ```

4. **Send Request**
   - Click "Send"
   - Check response status (should be 200)
   - Copy the `jwtToken` from response

## Testing Different Scenarios

### Test 1: Valid Credentials
- Email: `admin12@gmail.com`
- Password: `admin123`
- Expected: 200 OK with token

### Test 2: Invalid Email
- Email: `wrong@email.com`
- Password: `admin123`
- Expected: 401 Unauthorized

### Test 3: Invalid Password
- Email: `admin12@gmail.com`
- Password: `wrongpassword`
- Expected: 401 Unauthorized

### Test 4: Missing Email
- Email: (empty)
- Password: `admin123`
- Expected: 400 Bad Request

### Test 5: Missing Password
- Email: `admin12@gmail.com`
- Password: (empty)
- Expected: 400 Bad Request

## Performance Notes

- API is optimized for fast response times
- Uses lean queries for better performance
- Early validation to reject invalid requests quickly
- Password comparison uses optimized bcrypt

## Dashboard Stats Endpoint

**Method:** `GET`  
**URL:** `http://localhost:5000/api/admin/dashboard/stats`  
**Headers:** 
- `Authorization`: `Bearer <jwtToken>`

### Expected Response (200)

```json
{
  "success": true,
  "message": "Dashboard stats retrieved",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "totalOrders": 0,
    "totalPayments": 0,
    "pendingOrders": 0,
    "completedOrders": 0
  }
}
```
