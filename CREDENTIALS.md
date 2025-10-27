# User Credentials

This document contains the login credentials for all user roles in the platform.

## Available Users

### 1. Admin (Super Administrator)
- **Email:** `superadmin@platform.com`
- **Password:** `admin123`
- **Role:** ADMIN
- **Permissions:** Full access to everything
  - Create, read, update, delete all data
  - Manage users (view, create, update roles, delete)
  - Create and publish models
  - Access all dynamic model APIs
  - User Management dashboard

### 2. Manager
- **Email:** `manager@company.com`
- **Password:** `manager123`
- **Role:** MANAGER
- **Permissions:** Create, read, and update
  - Create new records in models
  - Read all records
  - Update existing records
  - ❌ Cannot delete records
  - ❌ Cannot manage users
  - ❌ Cannot publish models

### 3. Viewer
- **Email:** `viewer@company.com`
- **Password:** `viewer123`
- **Role:** VIEWER
- **Permissions:** Read-only access
  - Read all records
  - ❌ Cannot create records
  - ❌ Cannot update records
  - ❌ Cannot delete records
  - ❌ Cannot manage users
  - ❌ Cannot publish models

## How to Login

1. Go to: `http://localhost:5173/login`
2. Enter one of the email addresses above
3. Enter the corresponding password
4. Click "Login"

## Security Notes

⚠️ **Important:** These are default development credentials. In production:
- Change all default passwords immediately
- Use strong, unique passwords
- Enable two-factor authentication if available
- Rotate credentials regularly
- Never commit credentials to version control

## Testing RBAC

To test Role-Based Access Control:

1. **Login as Admin** → Test all operations (should work)
2. **Login as Manager** → Test create/read/update (should work), try delete (should fail)
3. **Login as Viewer** → Test read (should work), try create/update/delete (should fail)

## API Authentication

To use the API directly:

```bash
# 1. Login to get token
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@platform.com","password":"admin123"}'

# 2. Use the token in subsequent requests
curl -X GET http://localhost:3001/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Password Reset

If you forget a password or need to reset:

```bash
cd server
npx ts-node setup-users.ts
```

This will reset all passwords to the defaults listed above.

---

**Last Updated:** January 2, 2025
