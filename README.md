# RoomSplit 🏠₹

<<<<<<< HEAD
**Smart shared expense tracking for roommates** — built with React, a clean MVC architecture, localStorage persistence, and full dark-mode support.
=======
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
>>>>>>> cd1ec2f (updated backend env fix)

---

## Features

| Feature | Details |
<<<<<<< HEAD
|---|---|
| **Auth** | Sign up / login with email + password |
| **Groups** | Create groups, join via 6-char invite code |
| **Expenses** | Add, edit, delete (creator only), categories, notes |
| **Custom Split** | Equal / custom weights / payer-only per expense |
| **Recurring** | Tag any expense as monthly recurring |
| **Budgets** | Set monthly budget per member with live progress bar |
| **Settlement** | Minimum-transaction debt simplification algorithm |
| **Mark Paid** | Track which settlement transactions are done |
| **Analytics** | Daily bar chart, category breakdown, member comparison |
| **Activity Feed** | Chronological expense feed with relative timestamps |
| **Dark Mode** | Full theme toggle, persisted across sessions |
| **CSV Export** | One-click export of any month's expenses |
| **Month Nav** | Browse analytics / settlement for any past month |

---

## Architecture — MVC

```
src/
├── model/
│   ├── StorageModel.js        ← persistence (localStorage, swap for any backend)
│   └── DomainModel.js         ← pure business logic (settlement algo, filters, CSV)
│
├── controllers/
│   ├── useAppState.js         ← single source of truth (React hook)
│   ├── AuthController.js      ← login, signup, logout, profile
│   ├── GroupController.js     ← create, join, rename, leave groups
│   ├── ExpenseController.js   ← CRUD for expenses
│   └── BudgetAndSettlementController.js ← budgets + paid tracking
│
├── views/
│   ├── components/
│   │   ├── ui.jsx             ← shared atoms: Btn, Modal, Avatar, Chip, Toggle…
│   │   └── ExpenseForm.jsx    ← reusable expense add/edit form
│   ├── tabs/
│   │   └── index.jsx          ← all 6 dashboard tabs
│   ├── AuthView.jsx
│   ├── HomeView.jsx
│   └── DashboardView.jsx
│
├── constants.js               ← CATS, PAL (categories + colour palette)
├── App.jsx                    ← root: wires MVC, owns routing + theme
├── main.jsx                   ← React entry point
└── index.css                  ← CSS variables (light + dark tokens), global styles
```

### Key design decisions

- **Controllers are plain JS factory functions** — no React, fully testable without a DOM.
- **`useAppState` is the only stateful hook** — all controllers receive `(state, patch)` and are re-created via `useMemo` when state changes.
- **`StorageModel` is the only I/O** — swap it for fetch/Supabase/Firebase without touching anything else.
- **Modals use `createPortal`** — rendered into `#modal-portal` (sibling of `#app-root`), so they are never clipped by parent overflow.
- **CSS variables** drive the entire theme — `[data-theme=dark]` overrides every token; no JS color logic in components.

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### Install & run

```bash
# Unzip and enter the project
unzip roomsplit.zip
cd roomsplit

# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev
```

### Production build

```bash
npm run build     # outputs to dist/
npm run preview   # preview the built app locally
```

---

## How to use

1. **Sign Up** with your name, email, password.
2. **Create a Group** — give it a name (e.g. "Flat 3B").
3. **Share the invite code** with roommates (visible in Settings → Invite Code).
4. **Roommates sign up** and use **Join Group** to enter the code.
5. Each member adds their own expenses — other members can view but not edit them.
6. Switch to the **Settlement** tab at month-end to see who pays whom.

---

## Expense Split Types

| Type | Behaviour |
|---|---|
| **Equal** | Total split evenly across all group members |
| **Custom weights** | Enter point values per person; shares are proportional |
| **Payer only** | Entire amount counts only for the person who added it |

---

## Settlement Algorithm

Uses a **greedy minimum-transaction** approach:

1. Calculate each member's balance = amount_spent − equal_share.
2. Sort creditors (positive balance) and debtors (negative balance).
3. Greedily match largest creditor with largest debtor until all debts are resolved.

Result: fewest possible bank transfers to clear all debts.

---

## Customisation

- **Add a category** — edit `CATS` in `src/constants.js`.
- **Change colour palette** — edit `PAL` in `src/constants.js`.
- **Use a remote backend** — replace `StorageModel.js` with API calls; no other file changes needed.
- **Add currency** — search `₹` in the codebase and replace with your symbol.
=======
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
>>>>>>> cd1ec2f (updated backend env fix)
