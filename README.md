# Luxury Platok — Premium E-Commerce

A full-stack MERN e-commerce application for **Luxury Platok**, a premium hijab, platok, and shawl brand based in Tashkent, Uzbekistan. Built with a luxury aesthetic, bilingual support (Russian / Uzbek), and deep integration with local payment gateways and a Telegram admin bot.

---

## Features

### Storefront
- Product catalog with filtering by category, material, and pattern
- Product detail pages with color/size selection
- Shopping cart with persistent state (Zustand + localStorage)
- Checkout flow supporting home delivery and in-store pickup
- Guest checkout (no account required)
- Russian / Uzbek language toggle throughout the UI

### Pricing & Orders
- Retail pricing for standard customers
- **Wholesale tiered pricing** — automatically applied for verified wholesale accounts
- Order status tracking: pending → confirmed → processing → shipped → delivered
- Full order history for registered users

### Payments
- **Click** and **Payme** Uzbek payment gateway integration
- Webhook handlers for payment confirmation

### Telegram Bot
- New order notifications sent instantly to the admin with an inline keyboard
- Admin can confirm, process, ship, deliver, or cancel orders directly from Telegram
- Customers with linked Telegram accounts receive automatic status update messages in their preferred language (RU/UZ)
- Bot commands: `/orders`, `/pending`, `/stats`, `/order <number>`

### Admin Panel (`/admin`)
- Dashboard with live stats: total orders, pending orders, revenue, customer count
- Order management: view all orders, expand for full details, update status via dropdown
- Product management: create, edit, delete products with full bilingual form
- Customer management: view all users, approve wholesale accounts, deactivate users
- Protected route — only accessible to users with the `admin` role

### Security
- JWT authentication (30-day expiry, httpOnly-safe)
- bcrypt password hashing
- Helmet HTTP security headers
- CORS configured per environment
- Rate limiting on all API routes (100 req/15 min) and stricter limits on auth routes (10 req/15 min)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| State | Zustand with persist middleware |
| UI Components | Radix UI (Dialog, Select, Slider, Toast), Lucide React |
| Backend | Node.js, Express, ES Modules |
| Database | MongoDB Atlas, Mongoose |
| Auth | JWT + bcryptjs |
| Bot | node-telegram-bot-api (long polling) |
| Security | Helmet, CORS, express-rate-limit |
| Dev | Nodemon, Concurrently |

### Design Tokens
| Name | Hex |
|---|---|
| Soft Pink | `#E8A2B5` |
| Gold | `#C9A96E` |
| White | `#FAFAFA` |
| Charcoal | `#1A1A1A` |

Fonts: **Playfair Display** (headings) + **Inter** (body)

---

## Project Structure

```
fullstackProject/
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── api/             # Axios instance + adminApi helpers
│   │   ├── components/      # Shared UI, layout, home, product components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── i18n/            # ru.js and uz.js translation objects
│   │   ├── pages/           # Home, Products, ProductDetail, Checkout, Auth, Stores, Admin
│   │   └── store/           # Zustand stores: authStore, cartStore, languageStore
│   ├── tailwind.config.js   # Custom color palette and design tokens
│   └── vite.config.js       # Dev proxy /api → localhost:8000
│
└── server/                  # Express REST API
    ├── config/db.js          # MongoDB Atlas connection
    ├── controllers/          # authController, productController, orderController, paymentController
    ├── middleware/           # JWT protect, admin guard, error handler
    ├── models/               # User, Product, Order (Mongoose schemas)
    ├── routes/               # auth, products, orders, payments, admin
    ├── utils/
    │   ├── telegramBot.js    # Bot init, admin notifications, user status updates
    │   ├── generateToken.js  # JWT helper
    │   └── seeder.js         # Sample product data seeder
    └── server.js             # Entry point
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- A [MongoDB Atlas](https://cloud.mongodb.com) cluster
- A Telegram bot token from [@BotFather](https://t.me/BotFather)

### 1. Clone and install

```bash
git clone <repo-url>
cd fullstackProject
npm run install:all
```

### 2. Configure environment

Create `server/.env`:

```env
NODE_ENV=development
PORT=8000

MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/<dbname>?appName=Cluster0

JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=30d

TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_ADMIN_CHAT_ID=your_telegram_chat_id

# Click (Uzbekistan)
CLICK_MERCHANT_ID=your_merchant_id
CLICK_SERVICE_ID=your_service_id
CLICK_SECRET_KEY=your_secret_key
CLICK_RETURN_URL=http://localhost:5173/payment/success

# Payme (Uzbekistan)
PAYME_MERCHANT_ID=your_merchant_id
PAYME_SECRET_KEY=your_secret_key
PAYME_TEST_URL=https://checkout.test.paycom.uz
PAYME_PROD_URL=https://checkout.paycom.uz

CLIENT_URL=http://localhost:5173
```

> **Tip:** To find your Telegram Chat ID, message your bot then visit `https://api.telegram.org/bot<TOKEN>/getUpdates`

### 3. Seed the database

```bash
npm run seed
```

This creates 4 sample products and an initial admin user. Set the admin credentials directly in `server/utils/seeder.js` before running.

### 4. Run in development

```bash
npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5174 |
| Backend API | http://localhost:8000 |
| Admin Panel | http://localhost:5174/admin |

> Port 5000 is reserved by macOS Control Center. This project uses **8000** for the backend.

---

## API Reference

### Auth — `/api/auth`
| Method | Endpoint | Access |
|---|---|---|
| POST | `/register` | Public |
| POST | `/login` | Public |
| GET | `/me` | Private |
| PUT | `/profile` | Private |

### Products — `/api/products`
| Method | Endpoint | Access |
|---|---|---|
| GET | `/` | Public |
| GET | `/:slug` | Public |
| POST | `/` | Admin |
| PUT | `/:id` | Admin |
| DELETE | `/:id` | Admin |

### Orders — `/api/orders`
| Method | Endpoint | Access |
|---|---|---|
| POST | `/` | Public/Private |
| GET | `/my` | Private |
| GET | `/:id` | Private |
| GET | `/` | Admin |
| PUT | `/:id/status` | Admin |

### Admin — `/api/admin`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard` | Stats + recent orders |
| GET | `/users` | All users (filterable by role) |
| PUT | `/users/:id/approve-wholesale` | Grant wholesale role |
| PUT | `/users/:id/deactivate` | Deactivate account |

### Payments — `/api/payments`
| Method | Endpoint |
|---|---|
| POST | `/click/prepare` |
| POST | `/click/complete` |
| POST | `/payme` |

---

## Physical Store Locations

| Store | Location |
|---|---|
| Chorsu / Funcha | Chorsu Bazaar area, Tashkent |
| Yunusabad | Yunusabad district, Tashkent |
| Abu Sahiy | Abu Sahiy market, Tashkent |

---

## Telegram Bot Commands

Send these commands to the admin bot:

| Command | Description |
|---|---|
| `/start` | Welcome message + command list |
| `/orders` | Last 8 orders with inline action buttons |
| `/pending` | All orders awaiting confirmation |
| `/stats` | Today's order count, revenue, and totals |
| `/order LP-XXXX` | Look up a specific order by number |

Inline buttons on each order card: **Confirm · Processing · Shipped · Delivered · Cancel**

---

## License

Private project — all rights reserved. © Luxury Platok, Tashkent.
