# 📦 Sample Model Examples

This document provides ready-to-use model examples that you can create through the UI to get started quickly.

---

## 🛍️ Product Model (E-commerce)

### Use Case
Track product inventory with pricing, stock levels, and availability status.

### Model Configuration

**Basic Info:**
- **Name:** `product`
- **Display Name:** Product
- **Description:** Product inventory management

**Fields:**

| Field | Type | Required | Unique | Purpose |
|-------|------|----------|--------|---------|
| name | String | ✅ | ❌ | Product name |
| sku | String | ✅ | ✅ | Stock Keeping Unit (unique identifier) |
| price | Float | ✅ | ❌ | Product price in dollars |
| quantity | Int | ✅ | ❌ | Current stock quantity |
| active | Boolean | ❌ | ❌ | Is product currently available |

**RBAC Permissions:**

| Role | Create | Read | Update | Delete |
|------|--------|------|--------|--------|
| ADMIN | ✅ | ✅ | ✅ | ✅ |
| MANAGER | ✅ | ✅ | ✅ | ❌ |
| VIEWER | ❌ | ✅ | ❌ | ❌ |

### Sample Data

```json
{
  "name": "MacBook Pro 16\"",
  "sku": "MBP-16-2025",
  "price": 2499.99,
  "quantity": 15,
  "active": true
}
```

```json
{
  "name": "Wireless Mouse",
  "sku": "WM-BT-001",
  "price": 29.99,
  "quantity": 150,
  "active": true
}
```

---

## 👥 Customer Model (CRM)

### Use Case
Manage customer information and track loyalty points for marketing campaigns.

### Model Configuration

**Basic Info:**
- **Name:** `customer`
- **Display Name:** Customer
- **Description:** Customer relationship management

**Fields:**

| Field | Type | Required | Unique | Purpose |
|-------|------|----------|--------|---------|
| firstName | String | ✅ | ❌ | Customer's first name |
| lastName | String | ✅ | ❌ | Customer's last name |
| email | String | ✅ | ✅ | Contact email (unique) |
| phone | String | ❌ | ❌ | Phone number |
| loyaltyPoints | Int | ❌ | ❌ | Reward points balance |
| isActive | Boolean | ❌ | ❌ | Customer account status |

**RBAC Permissions:**

| Role | Create | Read | Update | Delete |
|------|--------|------|--------|--------|
| ADMIN | ✅ | ✅ | ✅ | ✅ |
| MANAGER | ✅ | ✅ | ✅ | ❌ |
| VIEWER | ❌ | ✅ | ❌ | ❌ |

### Sample Data

```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@email.com",
  "phone": "+1-555-0123",
  "loyaltyPoints": 2500,
  "isActive": true
}
```

```json
{
  "firstName": "Michael",
  "lastName": "Johnson",
  "email": "m.johnson@company.com",
  "phone": "+1-555-0456",
  "loyaltyPoints": 150,
  "isActive": true
}
```

---

## ✅ Task Model (Project Management)

### Use Case
Track project tasks with priorities and time estimates for team coordination.

### Model Configuration

**Basic Info:**
- **Name:** `task`
- **Display Name:** Task
- **Description:** Project task management

**Fields:**

| Field | Type | Required | Unique | Purpose |
|-------|------|----------|--------|---------|
| title | String | ✅ | ❌ | Task title/summary |
| description | String | ❌ | ❌ | Detailed task description |
| priority | Int | ✅ | ❌ | Priority level (1-5) |
| estimatedHours | Float | ❌ | ❌ | Estimated time to complete |
| completed | Boolean | ❌ | ❌ | Task completion status |

**RBAC Permissions:**

| Role | Create | Read | Update | Delete |
|------|--------|------|--------|--------|
| ADMIN | ✅ | ✅ | ✅ | ✅ |
| MANAGER | ✅ | ✅ | ✅ | ✅ |
| VIEWER | ❌ | ✅ | ❌ | ❌ |

### Sample Data

```json
{
  "title": "Implement user authentication",
  "description": "Add JWT-based authentication to the API",
  "priority": 5,
  "estimatedHours": 8.5,
  "completed": false
}
```

```json
{
  "title": "Fix mobile responsive layout",
  "description": "Hamburger menu not displaying correctly on iOS",
  "priority": 3,
  "estimatedHours": 2.0,
  "completed": true
}
```

---

## 📚 Book Model (Library)

### Use Case
Catalog library books with ISBN tracking and availability status.

### Model Configuration

**Basic Info:**
- **Name:** `book`
- **Display Name:** Book
- **Description:** Library book catalog

**Fields:**

| Field | Type | Required | Unique | Purpose |
|-------|------|----------|--------|---------|
| title | String | ✅ | ❌ | Book title |
| author | String | ✅ | ❌ | Author name |
| isbn | String | ✅ | ✅ | ISBN number |
| pages | Int | ❌ | ❌ | Number of pages |
| price | Float | ❌ | ❌ | Book price |
| available | Boolean | ❌ | ❌ | Is available for checkout |

**RBAC Permissions:**

| Role | Create | Read | Update | Delete |
|------|--------|------|--------|--------|
| ADMIN | ✅ | ✅ | ✅ | ✅ |
| MANAGER | ✅ | ✅ | ✅ | ❌ |
| VIEWER | ❌ | ✅ | ❌ | ❌ |

### Sample Data

```json
{
  "title": "The Pragmatic Programmer",
  "author": "David Thomas, Andrew Hunt",
  "isbn": "978-0135957059",
  "pages": 352,
  "price": 49.99,
  "available": true
}
```

---

## 🏢 Employee Model (HR)

### Use Case
Manage employee records with department and salary information.

### Model Configuration

**Basic Info:**
- **Name:** `employee`
- **Display Name:** Employee
- **Description:** Employee management system

**Fields:**

| Field | Type | Required | Unique | Purpose |
|-------|------|----------|--------|---------|
| fullName | String | ✅ | ❌ | Employee full name |
| employeeId | String | ✅ | ✅ | Company employee ID |
| department | String | ✅ | ❌ | Department name |
| salary | Float | ❌ | ❌ | Annual salary |
| yearsOfExperience | Int | ❌ | ❌ | Years of experience |
| isActive | Boolean | ❌ | ❌ | Employment status |

**RBAC Permissions:**

| Role | Create | Read | Update | Delete |
|------|--------|------|--------|--------|
| ADMIN | ✅ | ✅ | ✅ | ✅ |
| MANAGER | ✅ | ✅ | ✅ | ❌ |
| VIEWER | ❌ | ✅ | ❌ | ❌ |

### Sample Data

```json
{
  "fullName": "Sarah Williams",
  "employeeId": "EMP-2025-001",
  "department": "Engineering",
  "salary": 95000.00,
  "yearsOfExperience": 5,
  "isActive": true
}
```

---

## 🎯 Campaign Model (Marketing)

### Use Case
Track marketing campaigns with budget and performance metrics.

### Model Configuration

**Basic Info:**
- **Name:** `campaign`
- **Display Name:** Campaign
- **Description:** Marketing campaign tracking

**Fields:**

| Field | Type | Required | Unique | Purpose |
|-------|------|----------|--------|---------|
| name | String | ✅ | ✅ | Campaign name |
| description | String | ❌ | ❌ | Campaign description |
| budget | Float | ✅ | ❌ | Budget in dollars |
| impressions | Int | ❌ | ❌ | Number of impressions |
| conversionRate | Float | ❌ | ❌ | Conversion percentage |
| isActive | Boolean | ❌ | ❌ | Campaign status |

**RBAC Permissions:**

| Role | Create | Read | Update | Delete |
|------|--------|------|--------|--------|
| ADMIN | ✅ | ✅ | ✅ | ✅ |
| MANAGER | ✅ | ✅ | ✅ | ✅ |
| VIEWER | ❌ | ✅ | ❌ | ❌ |

### Sample Data

```json
{
  "name": "Summer Sale 2025",
  "description": "Q2 promotional campaign for summer products",
  "budget": 50000.00,
  "impressions": 125000,
  "conversionRate": 3.5,
  "isActive": true
}
```

---

## 🎓 How to Create These Models

### Step 1: Navigate to Model Builder
1. Login to the platform
2. Click **"Define Models"** in the sidebar
3. Or click **"➕ New Model"** button

### Step 2: Fill in Basic Information
- Enter the **name** (lowercase, no spaces)
- Enter the **Display Name** (human-readable)
- Add a **description**

### Step 3: Add Fields
For each field in the table:
1. Click **"➕ Add Field"**
2. Fill in field name and display name
3. Select the **type** (String, Int, Float, Boolean)
4. Check **Required** if the field is mandatory
5. Check **Unique** if the value must be unique

### Step 4: Configure RBAC
For each role (ADMIN, MANAGER, VIEWER):
- Check **Create** to allow creating records
- Check **Read** to allow viewing records
- Check **Update** to allow editing records
- Check **Delete** to allow deleting records

### Step 5: Publish
Click **"🚀 Publish Model"** and your API endpoints are instantly available!

---

## 🔌 Testing Your Models

Once published, you can:

1. **Find it in Sidebar** - Look under "Data Models"
2. **Click to Manage** - Access the CRUD interface
3. **Add Records** - Use the "➕ Add New" button
4. **Test API** - Use the endpoints at `/api/{modelname}`

---

## 💡 Tips

- ✅ Start with simple models and add complexity later
- ✅ Use **unique** constraint for identifiers (SKU, email, employee ID)
- ✅ Set **required** for critical business fields
- ✅ Use **Float** for prices and percentages
- ✅ Use **Int** for counts and quantities
- ✅ Use **Boolean** for status flags (active, completed, etc.)

---

**Ready to build? Start with the Product model and experiment! 🚀**
