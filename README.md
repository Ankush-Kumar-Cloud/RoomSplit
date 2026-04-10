# RoomSplit 🏠₹

**Smart shared expense tracking for roommates** — built with React, a clean MVC architecture, localStorage persistence, and full dark-mode support.

---

## Features

| Feature | Details |
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
