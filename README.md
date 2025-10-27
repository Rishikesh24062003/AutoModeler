# 🚀 Dynamic CRUD Platform with RBAC

> **A modern low-code platform that lets you visually define data models and instantly generate full-stack CRUD APIs with role-based access control!**

Built with **React**, **TypeScript**, **Node.js**, **Express**, **PostgreSQL**, and **Prisma ORM**.

---

## ✨ Features

🎨 **Visual Model Builder** - Define data models through an intuitive dark-themed UI  
⚡ **Instant API Generation** - Auto-generated REST APIs with full CRUD operations  
🔐 **Role-Based Access Control** - Granular permissions (Admin, Manager, Viewer)  
🗄️ **PostgreSQL Database** - Production-ready data persistence  
📱 **Mobile-First Design** - Fully responsive with glassmorphism effects  
🔥 **Hot Reload** - New models are instantly available without server restart  
👑 **Super Admin System** - Protected first user with elevated privileges  

---

## 🎬 Short Video

[Screen Recording 2025-10-27 at 11.35.40 PM.mov](./Screen%20Recording%202025-10-27%20at%2011.35.40%20PM.mov)

> **Watch a quick demo of the platform in action!** This video shows how to create models, publish them, and use the auto-generated CRUD APIs with role-based permissions.

---

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [How to Run the App](#-how-to-run-the-app)
- [How to Create & Publish Models](#-how-to-create--publish-models)
- [How File-Write Works](#-how-file-write-works)
- [Dynamic CRUD Endpoints](#-dynamic-crud-endpoints)
- [Sample Models](#-sample-models)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)

---

## ⚡ Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** 14+
- **Git**

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd untitled-folder-3

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Environment Setup

Create `.env` file in the **server** directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/crud_platform"
JWT_SECRET="your-super-secret-jwt-key-change-this"
PORT=5000
```

### Database Setup

```bash
# Navigate to server directory
cd server

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) View database in Prisma Studio
npx prisma studio
```

---

## 🏃 How to Run the App

### Start the Backend Server

```bash
cd server
npm run dev
# Server runs at http://localhost:5000
```

### Start the Frontend Client

```bash
cd client
npm run dev
# Client runs at http://localhost:5173
```

### First Time Login

1. Navigate to `http://localhost:5173`
2. **Register** the first user - this user automatically becomes the **Super Admin** 👑
3. Login with your credentials
4. You'll see the dashboard with navigation sidebar

> **Note**: The first registered user has special privileges and cannot be deleted or demoted!

---

## 🎨 How to Create & Publish Models

### Step-by-Step Guide

#### 1️⃣ Navigate to Model Builder

- Click **"Define Models"** in the sidebar
- Or click **"➕ New Model"** button in the Data Models section

#### 2️⃣ Define Basic Information

```
Model Name:       Product
Display Name:     Product
Description:      Manage product inventory
```

#### 3️⃣ Add Fields

Click **"➕ Add Field"** and define each field:

| Field Name | Type     | Required | Unique | Description           |
|-----------|----------|----------|--------|-----------------------|
| name      | String   | ✅       | ❌     | Product name          |
| sku       | String   | ✅       | ✅     | Stock keeping unit    |
| price     | Float    | ✅       | ❌     | Product price         |
| quantity  | Int      | ✅       | ❌     | Available quantity    |
| active    | Boolean  | ❌       | ❌     | Is product active     |

**Available Field Types:**
- `String` - Text data
- `Int` - Integer numbers
- `Float` - Decimal numbers
- `Boolean` - True/false values
- `DateTime` - Date and time

#### 4️⃣ Configure RBAC Permissions

Set permissions for each role:

```
ADMIN Role:
✅ Create  ✅ Read  ✅ Update  ✅ Delete

MANAGER Role:
✅ Create  ✅ Read  ✅ Update  ❌ Delete

VIEWER Role:
❌ Create  ✅ Read  ❌ Update  ❌ Delete
```

#### 5️⃣ Publish Model

- Click **"🚀 Publish Model"**
- The model is saved to PostgreSQL
- CRUD API endpoints are **instantly generated**
- New route appears in sidebar under "Data Models"
- **No server restart needed!** ⚡

---

## 📝 How File-Write Works

### Database-First Architecture

This platform uses a **database-driven approach** instead of writing TypeScript model files:

```
┌─────────────────────────────────────────────────┐
│  1. User Defines Model in UI                    │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  2. Model Saved to PostgreSQL                   │
│     - models table (name, description)          │
│     - fields table (name, type, constraints)    │
│     - permissions table (role, CRUD flags)      │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  3. Dynamic Router Service Triggered            │
│     - loadModelRoutes(modelId)                  │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  4. Express Router Created In-Memory            │
│     - POST   /api/modelname                     │
│     - GET    /api/modelname                     │
│     - GET    /api/modelname/:id                 │
│     - PUT    /api/modelname/:id                 │
│     - DELETE /api/modelname/:id                 │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  5. Routes Immediately Available! 🎉            │
│     No file writes, no server restart           │
└─────────────────────────────────────────────────┘
```

### Key Database Tables

#### `models` Table
```sql
id          SERIAL PRIMARY KEY
name        TEXT UNIQUE          -- URL-safe name (e.g., "product")
displayName TEXT                 -- Human-readable (e.g., "Product")
tableName   TEXT UNIQUE          -- Table reference
description TEXT
isActive    BOOLEAN DEFAULT true
```

#### `fields` Table
```sql
id          SERIAL PRIMARY KEY
modelId     INTEGER REFERENCES models(id)
name        TEXT                 -- Field name
displayName TEXT                 -- Display name
type        TEXT                 -- String, Int, Float, Boolean, DateTime
isRequired  BOOLEAN DEFAULT false
isUnique    BOOLEAN DEFAULT false
order       INTEGER              -- Field display order
```

#### `permissions` Table
```sql
id          SERIAL PRIMARY KEY
modelId     INTEGER REFERENCES models(id)
role        TEXT                 -- ADMIN, MANAGER, VIEWER
canCreate   BOOLEAN DEFAULT false
canRead     BOOLEAN DEFAULT false
canUpdate   BOOLEAN DEFAULT false
canDelete   BOOLEAN DEFAULT false
```

#### `records` Table (Data Storage)
```sql
id          SERIAL PRIMARY KEY
modelId     INTEGER REFERENCES models(id)
ownerId     INTEGER REFERENCES users(id)
data        JSONB                -- All field values stored as JSON!
createdAt   TIMESTAMP
updatedAt   TIMESTAMP
```

### Why No File Writes?

✅ **Dynamic**: Models available instantly without deployment  
✅ **Scalable**: No filesystem limitations  
✅ **Safe**: No code generation security risks  
✅ **Flexible**: Easy to modify models at runtime  
✅ **Production-Ready**: Works in containerized environments  

---

## 🔄 Dynamic CRUD Endpoints

### How Routes Are Registered

The magic happens in **`server/src/services/dynamicRouter.service.ts`**:

#### On Server Start

```typescript
export async function initializeDynamicRoutes(app: Express) {
  // 1. Fetch all active models from database
  const models = await prisma.model.findMany({
    where: { isActive: true },
    include: { fields: true, permissions: true }
  });

  // 2. Create router for each model
  for (const model of models) {
    const router = createCRUDRouter(model);
    app.use(`/api/${model.tableName}`, router);
    loadedModels.add(model.tableName);
  }
}
```

#### On New Model Publish

```typescript
export async function loadModelRoutes(modelId: number) {
  // 1. Fetch the newly published model
  const model = await prisma.model.findUnique({
    where: { id: modelId },
    include: { fields: true, permissions: true }
  });

  // 2. Create and mount router dynamically
  const router = createCRUDRouter(model);
  appInstance.use(`/api/${model.tableName}`, router);
  
  // 3. Route is immediately available! ⚡
}
```

#### CRUD Router Factory

```typescript
function createCRUDRouter(model: any): Router {
  const router = Router();
  router.use(requireAuth); // Authentication required
  
  // Helper: Check RBAC permissions
  const checkPermission = (req, action) => {
    const userRole = req.user?.role;
    const permission = model.permissions.find(p => p.role === userRole);
    return permission?.[action] || false;
  };

  // POST / - Create record
  router.post('/', async (req, res) => {
    if (!checkPermission(req, 'canCreate')) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    // Validate fields against model.fields
    // Create record in records table with data as JSONB
    const record = await prisma.record.create({
      data: {
        modelId: model.id,
        ownerId: req.user.id,
        data: req.body // Stored as JSON!
      }
    });
  });

  // GET / - List all records
  router.get('/', async (req, res) => {
    if (!checkPermission(req, 'canRead')) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const records = await prisma.record.findMany({
      where: { modelId: model.id }
    });
  });

  // GET /:id - Get single record
  router.get('/:id', async (req, res) => { /* ... */ });

  // PUT /:id - Update record
  router.put('/:id', async (req, res) => {
    if (!checkPermission(req, 'canUpdate')) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    // Update logic...
  });

  // DELETE /:id - Delete record
  router.delete('/:id', async (req, res) => {
    if (!checkPermission(req, 'canDelete')) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    // Delete logic...
  });

  return router;
}
```

### Example API Flow

```bash
# 1. User creates "Product" model in UI
POST /api/models/publish
{
  "name": "product",
  "displayName": "Product",
  "fields": [...],
  "rbac": {...}
}

# 2. Server instantly registers routes
✅ POST   /api/product
✅ GET    /api/product
✅ GET    /api/product/:id
✅ PUT    /api/product/:id
✅ DELETE /api/product/:id

# 3. Immediately create product (RBAC protected)
POST /api/product
Authorization: Bearer <jwt-token>
{
  "name": "Laptop",
  "sku": "LAP-001",
  "price": 999.99,
  "quantity": 50,
  "active": true
}

# Response
{
  "message": "Product created successfully",
  "data": {
    "id": 1,
    "name": "Laptop",
    "sku": "LAP-001",
    "price": 999.99,
    "quantity": 50,
    "active": true,
    "createdAt": "2025-10-27T...",
    "updatedAt": "2025-10-27T...",
    "owner": { "id": 1, "email": "admin@example.com" }
  }
}
```

---

## 📦 Sample Models

Here are example models you can create through the UI:

### 1. Product Model

```json
{
  "name": "product",
  "displayName": "Product",
  "description": "Product inventory management",
  "fields": [
    {
      "name": "name",
      "displayName": "Product Name",
      "type": "String",
      "isRequired": true,
      "isUnique": false
    },
    {
      "name": "sku",
      "displayName": "SKU",
      "type": "String",
      "isRequired": true,
      "isUnique": true
    },
    {
      "name": "price",
      "displayName": "Price",
      "type": "Float",
      "isRequired": true,
      "isUnique": false
    },
    {
      "name": "quantity",
      "displayName": "Stock Quantity",
      "type": "Int",
      "isRequired": true,
      "isUnique": false
    },
    {
      "name": "active",
      "displayName": "Is Active",
      "type": "Boolean",
      "isRequired": false,
      "isUnique": false
    }
  ],
  "rbac": {
    "ADMIN": {
      "canCreate": true,
      "canRead": true,
      "canUpdate": true,
      "canDelete": true
    },
    "MANAGER": {
      "canCreate": true,
      "canRead": true,
      "canUpdate": true,
      "canDelete": false
    },
    "VIEWER": {
      "canCreate": false,
      "canRead": true,
      "canUpdate": false,
      "canDelete": false
    }
  }
}
```

### 2. Customer Model

```json
{
  "name": "customer",
  "displayName": "Customer",
  "description": "Customer relationship management",
  "fields": [
    {
      "name": "firstName",
      "displayName": "First Name",
      "type": "String",
      "isRequired": true,
      "isUnique": false
    },
    {
      "name": "lastName",
      "displayName": "Last Name",
      "type": "String",
      "isRequired": true,
      "isUnique": false
    },
    {
      "name": "email",
      "displayName": "Email Address",
      "type": "String",
      "isRequired": true,
      "isUnique": true
    },
    {
      "name": "phone",
      "displayName": "Phone Number",
      "type": "String",
      "isRequired": false,
      "isUnique": false
    },
    {
      "name": "loyaltyPoints",
      "displayName": "Loyalty Points",
      "type": "Int",
      "isRequired": false,
      "isUnique": false
    },
    {
      "name": "isActive",
      "displayName": "Active Customer",
      "type": "Boolean",
      "isRequired": false,
      "isUnique": false
    }
  ],
  "rbac": {
    "ADMIN": {
      "canCreate": true,
      "canRead": true,
      "canUpdate": true,
      "canDelete": true
    },
    "MANAGER": {
      "canCreate": true,
      "canRead": true,
      "canUpdate": true,
      "canDelete": false
    },
    "VIEWER": {
      "canCreate": false,
      "canRead": true,
      "canUpdate": false,
      "canDelete": false
    }
  }
}
```

### 3. Task Model

```json
{
  "name": "task",
  "displayName": "Task",
  "description": "Project task management",
  "fields": [
    {
      "name": "title",
      "displayName": "Task Title",
      "type": "String",
      "isRequired": true,
      "isUnique": false
    },
    {
      "name": "description",
      "displayName": "Description",
      "type": "String",
      "isRequired": false,
      "isUnique": false
    },
    {
      "name": "priority",
      "displayName": "Priority Level",
      "type": "Int",
      "isRequired": true,
      "isUnique": false
    },
    {
      "name": "estimatedHours",
      "displayName": "Estimated Hours",
      "type": "Float",
      "isRequired": false,
      "isUnique": false
    },
    {
      "name": "completed",
      "displayName": "Is Completed",
      "type": "Boolean",
      "isRequired": false,
      "isUnique": false
    }
  ],
  "rbac": {
    "ADMIN": {
      "canCreate": true,
      "canRead": true,
      "canUpdate": true,
      "canDelete": true
    },
    "MANAGER": {
      "canCreate": true,
      "canRead": true,
      "canUpdate": true,
      "canDelete": true
    },
    "VIEWER": {
      "canCreate": false,
      "canRead": true,
      "canUpdate": false,
      "canDelete": false
    }
  }
}
```

### How to Use Sample Models

1. Copy any model JSON above
2. Navigate to **Define Models** page
3. Fill in the form fields manually based on the JSON structure
4. Click **🚀 Publish Model**
5. Find your model in the sidebar under "Data Models"
6. Click to start managing data!

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Vite** - Build tool
- **CSS3** - Glassmorphism styling

### Backend
- **Node.js 18+** - Runtime
- **Express 5** - Web framework
- **TypeScript** - Type safety
- **Prisma ORM** - Database toolkit
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### DevOps
- **Nodemon** - Dev server auto-restart
- **ESLint** - Code linting
- **Prisma Studio** - Database GUI

---

## 📁 Project Structure

```
untitled-folder-3/
├── client/                          # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.tsx         # Navigation sidebar
│   │   │   ├── Sidebar.css         # Dark glassmorphism styles
│   │   │   └── ProtectedRoute.tsx  # Auth guard
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx       # Authentication
│   │   │   ├── DashboardHome.tsx   # Main dashboard
│   │   │   ├── ModelDefinitionPage.tsx  # Model builder
│   │   │   ├── DataManagementPage.tsx   # CRUD interface
│   │   │   └── UserManagementPage.tsx   # User admin
│   │   ├── context/
│   │   │   └── AuthContext.tsx     # Auth state management
│   │   ├── services/
│   │   │   └── api.ts              # API client with interceptors
│   │   └── types/
│   │       └── index.ts            # TypeScript definitions
│   ├── index.css                    # Global dark theme
│   └── package.json
│
├── server/                          # Express Backend
│   ├── src/
│   │   ├── index.ts                # App entry point
│   │   ├── lib/
│   │   │   └── prisma.ts           # Prisma client instance
│   │   ├── middleware/
│   │   │   └── auth.middleware.ts  # JWT verification
│   │   ├── routes/
│   │   │   ├── auth.routes.ts      # Login, register
│   │   │   ├── model.routes.ts     # Model CRUD
│   │   │   └── user.routes.ts      # User management
│   │   └── services/
│   │       └── dynamicRouter.service.ts  # 🌟 Route generator!
│   ├── prisma/
│   │   ├── schema.prisma           # Database schema
│   │   └── migrations/             # Migration history
│   └── package.json
│
└── README.md                        # This file!
```

---

## 🔌 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "role": "MANAGER"
}

Response: 201 Created
{
  "message": "User registered successfully",
  "user": {
    "id": 2,
    "email": "user@example.com",
    "role": "MANAGER",
    "isSuperAdmin": false
  }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response: 200 OK
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "email": "user@example.com",
    "role": "MANAGER"
  }
}
```

### Model Management Endpoints

#### Get All Models
```http
GET /models
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": 1,
    "name": "product",
    "displayName": "Product",
    "description": "Product inventory",
    "fields": [...],
    "permissions": [...]
  }
]
```

#### Publish Model
```http
POST /models/publish
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "product",
  "displayName": "Product",
  "description": "Manage products",
  "fields": [
    {
      "name": "name",
      "displayName": "Product Name",
      "type": "String",
      "isRequired": true,
      "isUnique": false
    }
  ],
  "rbac": {
    "ADMIN": {
      "canCreate": true,
      "canRead": true,
      "canUpdate": true,
      "canDelete": true
    }
  }
}

Response: 201 Created
{
  "message": "Model 'Product' published successfully",
  "model": { "id": 1, ... }
}
```

### Dynamic CRUD Endpoints

Once a model is published, these endpoints are automatically available:

#### Create Record
```http
POST /api/{modelName}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Laptop",
  "sku": "LAP-001",
  "price": 999.99,
  "quantity": 50
}

Response: 201 Created
```

#### Get All Records
```http
GET /api/{modelName}
Authorization: Bearer <token>

Response: 200 OK
[
  { "id": 1, "name": "Laptop", ... }
]
```

#### Get Single Record
```http
GET /api/{modelName}/:id
Authorization: Bearer <token>

Response: 200 OK
```

#### Update Record
```http
PUT /api/{modelName}/:id
Authorization: Bearer <token>
Content-Type: application/json

{ "quantity": 45 }

Response: 200 OK
```

#### Delete Record
```http
DELETE /api/{modelName}/:id
Authorization: Bearer <token>

Response: 200 OK
```

---

## 🎨 Design Features

### Dark Theme with Glassmorphism
- Semi-transparent cards with `backdrop-filter: blur(20px)`
- Gradient text effects and buttons
- Smooth animations and transitions
- Custom scrollbar styling

### Mobile-First Responsive
- Hamburger menu with close button
- Off-canvas sidebar navigation
- Horizontal scrolling tables
- Touch-optimized interactions

### Color System
```css
--color-primary: #6366f1       /* Indigo */
--color-bg-primary: #0a0e27    /* Dark navy */
--color-text-primary: #f1f5f9  /* Light gray */
```

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Register first user (becomes Super Admin)
- [ ] Login and access dashboard
- [ ] Create a model with various field types
- [ ] Verify model appears in sidebar
- [ ] Test CRUD operations on model data
- [ ] Check RBAC permissions work correctly
- [ ] Test mobile responsiveness
- [ ] Verify hamburger menu works

### Test with Sample Data

```bash
# Use the sample models provided above
# Create Product, Customer, and Task models
# Add records through the UI
# Test different user roles
```

---

## 🚀 Deployment

### Environment Variables

Production `.env`:
```env
DATABASE_URL="postgresql://user:pass@host:5432/dbname?sslmode=require"
JWT_SECRET="use-a-strong-random-secret-here"
PORT=5000
NODE_ENV=production
```

### Build Commands

```bash
# Build client
cd client
npm run build
# Output: client/dist/

# Build server
cd server
npm run build
# Output: server/dist/
```

### Production Start

```bash
# Run migrations
cd server
npx prisma migrate deploy

# Start server
npm start
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

---

## 📄 License

MIT License - feel free to use this project for learning and commercial purposes!

---

## 🙏 Credits

Built with ❤️ using modern web technologies.

**Key Libraries:**
- [React](https://react.dev)
- [Express](https://expressjs.com)
- [Prisma](https://prisma.io)
- [PostgreSQL](https://postgresql.org)

---

## 📞 Support

Need help? Have questions?

- 📧 Email: rishikeshmishra477@gmail.com

---

**Happy Building! 🎉**
