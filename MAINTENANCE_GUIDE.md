# Maintenance Guide

Complete maintenance documentation for Kiosk AI Backend.

## Table of Contents

1. [API Documentation](#api-documentation)
2. [Environment Setup](#environment-setup)
3. [Database Management](#database-management)
4. [Admin Credentials](#admin-credentials)
5. [Troubleshooting](#troubleshooting)
6. [Deployment](#deployment)

---

## API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

### Quick API Reference

**Base URL:** `http://localhost:5000` (Development)

**Swagger UI:** `http://localhost:5000/api-docs`

**Main Endpoints:**
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `PUT /api/admin/settings/profile` - Update profile
- `PUT /api/admin/settings/password` - Change password
- `PUT /api/admin/settings/site` - Update site settings
- `GET /api/admin/orders` - Get orders list
- `GET /api/admin/orders/:id` - Get order details
- `GET /api/admin/stripe-settings` - Get Stripe settings
- `PUT /api/admin/stripe-settings` - Update Stripe settings
- `POST /api/admin/stripe-settings/test` - Test Stripe connection

---

## Environment Setup

### Required Environment Variables

Create a `.env` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kiosk-ai

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Server Configuration
PORT=5000
HOST=localhost:5000
NODE_ENV=development
```

### Installation

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run in production mode
npm start

# Generate Swagger documentation
npm run swagger
```

---

## Database Management

### MongoDB Connection

The application uses MongoDB with Mongoose ODM.

**Connection String Format:**
```
mongodb+srv://username:password@cluster.mongodb.net/database-name
```

### Database Name
- Default: `kiosk-ai`

### Collections/Schemas

1. **Users** (`users`)
   - Admin users
   - Regular users
   - Fields: `first_name`, `last_name`, `email`, `password`, `emailVerified`, `isActive`

2. **StripeSettings** (`stripesettings`)
   - Stripe payment configuration
   - Fields: `publishableKey`, `secretKey`, `webhookSecret`, `isActive`, `currency`

3. **Orders** (Future implementation)
   - Customer orders
   - Fields: `orderNumber`, `customerName`, `customerEmail`, `totalAmount`, `status`, `items`

### Database Operations

**Connect to MongoDB:**
```bash
mongosh "mongodb+srv://username:password@cluster.mongodb.net/kiosk-ai"
```

**View Collections:**
```javascript
show collections
```

**View Users:**
```javascript
db.users.find().pretty()
```

**View Stripe Settings:**
```javascript
db.stripesettings.find().pretty()
```

---

## Admin Credentials

### Default Admin Account

**Email:** `admin12@gmail.com`  

### Prompt-to-Image AI Integration

- **Requirement:** an OpenAI API key must be provided in the environment as `OPENAI_API_KEY`.
- **Usage:** the backend exposes `POST /api/ai/generate` which accepts a JSON body
  with `prompt`, optional `style`, `additionalStyle`, and `count` fields.  The
  route proxies the request to the OpenAI images endpoint and returns an array
  of generated image URLs.
- **Security:** never commit the key to source control; store it in a secret
  manager or environment variable on the deployment platform.
**Password:** `admin123`

### Admin Creation

The admin user is automatically created on first login if it doesn't exist.

**Manual Creation (if needed):**
```bash
npm run seed:admin
```

### Changing Admin Password

1. Login via API: `POST /api/admin/login`
2. Use the token to call: `PUT /api/admin/settings/password`
3. Provide current and new password

**Password Requirements:**
- Minimum 6 characters
- At least one uppercase letter
- At least one special character (@#$%^&+!=)
- At least one number

---

## Troubleshooting

### Common Issues

#### 1. MongoDB Connection Error

**Error:** `querySrv ECONNREFUSED`

**Solution:**
- Check MongoDB URI in `.env`
- Verify network connectivity
- Check MongoDB Atlas IP whitelist
- DNS resolution fix is implemented in `src/config/db.ts`

#### 2. JWT Token Error

**Error:** `secretOrPrivateKey must have a value`

**Solution:**
- Ensure `JWT_SECRET` is set in `.env`
- Restart the server after adding `JWT_SECRET`

#### 3. Mongoose Buffering Timeout

**Error:** `Operation buffering timed out after 10000ms`

**Solution:**
- Ensure MongoDB connection is established before using models
- Check `src/config/db.ts` - connection logic is implemented
- Verify `MONGODB_URI` is correct

#### 4. Port Already in Use

**Error:** `EADDRINUSE: address already in use`

**Solution:**
```bash
# Find process using port 5000
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process or change PORT in .env
```

#### 5. Swagger Documentation Not Generating

**Error:** Swagger file not found

**Solution:**
```bash
# Generate Swagger docs
npm run swagger

# Check swagger_output.json exists
ls swagger_output.json
```

---

## Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Use strong `JWT_SECRET` (at least 32 characters)
- [ ] Update `MONGODB_URI` to production database
- [ ] Set proper `HOST` value
- [ ] Enable HTTPS/SSL
- [ ] Set up proper CORS configuration
- [ ] Configure rate limiting
- [ ] Set up logging and monitoring
- [ ] Configure environment-specific variables
- [ ] Test all API endpoints
- [ ] Generate and verify Swagger documentation

### Environment Variables (Production)

```env
NODE_ENV=production
PORT=5000
HOST=your-production-domain.com
MONGODB_URI=mongodb+srv://prod-user:prod-pass@cluster.mongodb.net/kiosk-ai-prod
JWT_SECRET=super-secure-production-secret-key-minimum-32-characters-long
```

### Build and Deploy

```bash
# Build TypeScript
npm run build

# Start production server
npm start

# Or use PM2 for process management
pm2 start dist/app.js --name kiosk-ai-backend
```

---

## API Testing

### Using Swagger UI

1. Start the server: `npm run dev`
2. Open browser: `http://localhost:5000/api-docs`
3. Click "Authorize" button
4. Enter Bearer token: `Bearer {your-jwt-token}`
5. Test endpoints directly from Swagger UI

### Using Postman

See [POSTMAN_TEST.md](./POSTMAN_TEST.md) for detailed Postman testing guide.

### Using cURL

**Login:**
```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin12@gmail.com","password":"admin123"}'
```

**Get Dashboard Stats:**
```bash
curl -X GET http://localhost:5000/api/admin/dashboard/stats \
  -H "Authorization: Bearer {your-jwt-token}"
```

---

## Logging

### Log Files

Logs are stored in the `logs/` directory:
- `combined-YYYY-MM-DD.log` - All logs
- `error-YYYY-MM-DD.log` - Error logs only

### Log Levels

- `error` - Error messages
- `warn` - Warning messages
- `info` - Informational messages
- `debug` - Debug messages

---

## Security Best Practices

1. **Never commit `.env` file** - Add to `.gitignore`
2. **Use strong JWT secrets** - Minimum 32 characters
3. **Hash passwords** - Already implemented with bcrypt
4. **Validate input** - All endpoints validate input
5. **Use HTTPS** - In production
6. **Rate limiting** - Consider implementing
7. **CORS configuration** - Configure properly for production
8. **Mask sensitive data** - Stripe keys are masked in responses

---

## Monitoring

### Health Check

**Endpoint:** `GET /health`

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600.5
}
```

### Database Status

Check MongoDB connection status in logs or use health endpoint.

---

## Backup and Recovery

### Database Backup

```bash
# MongoDB backup
mongodump --uri="mongodb+srv://username:password@cluster.mongodb.net/kiosk-ai" --out=./backup

# Restore from backup
mongorestore --uri="mongodb+srv://username:password@cluster.mongodb.net/kiosk-ai" ./backup/kiosk-ai
```

### Environment Backup

Always backup `.env` file securely (not in git).

---

## Updates and Versioning

### Version Information

Current version: `1.0.0`

### Updating Dependencies

```bash
# Check for outdated packages
npm outdated

# Update packages
npm update

# Update specific package
npm install package-name@latest
```

---

## Support

For issues or questions:
1. Check this maintenance guide
2. Review API documentation
3. Check logs in `logs/` directory
4. Contact development team

---

## Changelog

### Version 1.0.0
- Initial release
- Admin authentication system
- Dashboard statistics
- Profile and settings management
- Order management endpoints
- Stripe payment settings integration
- Swagger API documentation

---

## Additional Resources

- [API Documentation](./API_DOCUMENTATION.md)
- [Postman Test Guide](./POSTMAN_TEST.md)
- [Swagger UI](http://localhost:5000/api-docs)
