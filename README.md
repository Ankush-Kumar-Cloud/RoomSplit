# RoomSplit 🏠₹

**Smart shared expense tracking for roommates.**  
Monorepo: **Node.js + Express + MongoDB** backend · **React (Vite)** frontend · **JWT** auth · Full **dark mode** · Clean **MVC** architecture.

---

## Project Structure

```
roomsplit/
├── package.json              ← root workspace (runs both apps)
├── .env.example              ← copy to .env and fill in values
│
├── backend/
│   ├── server.js             ← Express app entry
│   ├── config/
│   │   └── db.js             ← Mongoose connection
│   ├── models/               ← MongoDB schemas
│   │   ├── User.js
│   │   ├── Group.js
│   │   ├── Expense.js
│   │   ├── Budget.js
│   │   └── Settlement.js
│   ├── controllers/          ← Route handlers (business logic)
│   │   ├── authController.js
│   │   ├── groupController.js
│   │   ├── expenseController.js
│   │   └── budgetSettlementController.js
│   ├── routes/               ← Express routers
│   │   ├── auth.js
│   │   ├── groups.js
│   │   └── expenses.js
│   └── middleware/
│       ├── auth.js           ← JWT protect + generateToken
│       └── validate.js       ← express-validator error handler
│
└── frontend/
    ├── index.html
    ├── vite.config.js        ← proxies /api → localhost:5000
    └── src/
        ├── main.jsx
        ├── App.jsx           ← root: routing, controller wiring, theme
        ├── constants.js      ← CATS (categories) + PAL (colours)
        ├── index.css         ← CSS variables: light + dark tokens
        ├── model/
        │   ├── ApiModel.js   ← ALL fetch() calls to REST API
        │   └── DomainModel.js← pure functions: settlement, filters, CSV
        ├── controllers/
        │   ├── useAppState.js
        │   ├── AuthController.js
        │   ├── GroupController.js
        │   ├── ExpenseController.js
        │   └── BudgetAndSettlementController.js
        └── views/
            ├── AuthView.jsx
            ├── HomeView.jsx
            ├── DashboardView.jsx
            ├── components/
            │   ├── ui.jsx          ← Btn, Modal (portal), Avatar, Chip, Toggle…
            │   └── ExpenseForm.jsx
            └── tabs/
                └── index.jsx       ← Expenses, Activity, Budgets, Analytics, Monthly, Settlement
```

---

## Quick Start

### 1 — Prerequisites

- Node.js 18+
- npm 9+
- MongoDB (local or Atlas)

### 2 — Clone & install

```bash
unzip roomsplit.zip
cd roomsplit

# Install root + both workspaces
npm run install:all
```

### 3 — Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
MONGO_URI=mongodb://localhost:27017/roomsplit   # or Atlas URI
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRES_IN=7d
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 4 — Run both servers

```bash
# Runs backend (port 5000) + frontend (port 5173) concurrently
npm run dev
```

Or run separately:

```bash
npm run dev:backend   # Express API
npm run dev:frontend  # React + Vite
```

### 5 — Open the app

```
http://localhost:5173
```

---

## REST API Reference

All protected routes require:  
`Authorization: Bearer <token>`

### Auth

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/auth/signup` | Public | Register new user |
| POST | `/api/auth/login`  | Public | Login, returns JWT |
| GET  | `/api/auth/me`     | Private | Get current user |
| PUT  | `/api/auth/me`     | Private | Update display name |

**Signup / Login body:**
```json
{ "name": "Rahul", "email": "rahul@example.com", "password": "secret123" }
```

**Response:**
```json
{
  "token": "eyJ...",
  "user": { "_id": "...", "name": "Rahul", "email": "rahul@example.com" }
}
```

---

### Groups

| Method | Route | Description |
|--------|-------|-------------|
| GET    | `/api/groups`          | All groups for current user |
| POST   | `/api/groups`          | Create a group |
| POST   | `/api/groups/join`     | Join by invite code |
| GET    | `/api/groups/:id`      | Get one group (must be member) |
| PUT    | `/api/groups/:id`      | Rename group (owner only) |
| DELETE | `/api/groups/:id/leave`| Leave group |

**Create group body:** `{ "name": "Flat 3B" }`  
**Join body:** `{ "inviteCode": "AB12CD" }`

---

### Expenses

All under `/api/groups/:groupId/expenses`

| Method | Route | Description |
|--------|-------|-------------|
| GET    | `/api/groups/:groupId/expenses`                    | List expenses (filterable) |
| POST   | `/api/groups/:groupId/expenses`                    | Add expense |
| PUT    | `/api/groups/:groupId/expenses/:expenseId`         | Edit (creator only) |
| DELETE | `/api/groups/:groupId/expenses/:expenseId`         | Delete (creator only) |

**GET query params:**
- `?date=YYYY-MM-DD` — filter by exact date
- `?month=YYYY-MM` — filter by month
- `?category=food` — filter by category
- `?search=milk` — search item name/note

**POST / PUT body:**
```json
{
  "item": "Aata",
  "amount": 150,
  "date": "2025-08-01",
  "note": "5kg bag",
  "category": "grocery",
  "recurring": false,
  "splitType": "equal",
  "splitWeights": {}
}
```

**Categories:** `food` · `rent` · `util` · `grocery` · `transport` · `health` · `fun` · `other`  
**splitType:** `equal` · `custom` · `payer`

---

### Budgets

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/groups/:groupId/budgets?month=YYYY-MM` | Get budgets for a month |
| PUT | `/api/groups/:groupId/budgets`               | Set/update a budget |

**PUT body:** `{ "userId": "...", "monthKey": "2025-08", "amount": 5000 }`

---

### Settlements

| Method | Route | Description |
|--------|-------|-------------|
| GET  | `/api/groups/:groupId/settlements?month=YYYY-MM` | Get paid status for a month |
| POST | `/api/groups/:groupId/settlements/toggle`         | Toggle a transaction paid/unpaid |

**POST body:** `{ "monthKey": "2025-08", "txnIndex": 0 }`

---

## MongoDB Schemas

### User
```
_id, name, email (unique), password (bcrypt hashed), createdAt, updatedAt
```

### Group
```
_id, name, owner (ref User), members [ref User], inviteCode (unique 6-char), createdAt
```

### Expense
```
_id, group (ref), user (ref), item, amount, date (YYYY-MM-DD),
note, category, recurring, splitType, splitWeights (Map),
createdAt, updatedAt
```
Indexes: `{ group, date }` · `{ group, user }`

### Budget
```
_id, group (ref), user (ref), monthKey (YYYY-MM), amount
```
Unique index: `{ group, user, monthKey }`

### Settlement
```
_id, group (ref), monthKey, txnIndex, paid, markedBy (ref User)
```
Unique index: `{ group, monthKey, txnIndex }`

---

## Architecture — MVC

### Model layer
- `ApiModel.js` — the **only** file that calls `fetch()`. Swap this for any other transport (WebSockets, GraphQL, native SDK) without touching controllers or views.
- `DomainModel.js` — pure functions: settlement algorithm, date helpers, CSV export, expense filtering. Zero I/O.

### Controller layer
- `useAppState.js` — single React hook owning all UI state. Restores session from JWT on mount.
- `AuthController`, `GroupController`, `ExpenseController`, `BudgetAndSettlementController` — plain JS factory functions. Each receives `(state, patch)` and returns action maps. No React.

### View layer
- All views receive controllers as props and call their methods.
- Views contain **zero business logic** — no direct `fetch()`, no algorithm, no state management.
- Modals use `createPortal` → `#modal-portal` (sibling of `#app-root`) so they're never clipped.

---

## Features

| Feature | Details |
|---------|---------|
| Auth | JWT signup/login, bcrypt hashed passwords, 7-day token |
| Groups | Create, join (invite code), rename (owner), leave |
| Expenses | Add/edit/delete (creator only), categories, notes |
| Splits | Equal / custom weights / payer-only |
| Recurring | Tag expenses as monthly recurring |
| Budgets | Per-member monthly budget with progress bar |
| Settlement | Minimum-transaction algorithm, mark as paid |
| Analytics | Daily bar chart, category breakdown, member comparison |
| Activity | Chronological feed with relative timestamps |
| Dark mode | Full CSS-variable theme, persisted to localStorage |
| CSV Export | One-click export for any month |
| Month nav | Browse any past month's data |

---

## Production Build

```bash
# Build frontend
cd frontend && npm run build

# Serve dist/ with Express (add this to server.js):
# app.use(express.static(path.join(__dirname, '../frontend/dist')));
# app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../frontend/dist/index.html')));
```

Set `NODE_ENV=production` and use a process manager like PM2:

```bash
npm install -g pm2
pm2 start backend/server.js --name roomsplit
```
