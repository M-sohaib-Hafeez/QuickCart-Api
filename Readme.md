# 🛒 QuickCart API

A backend REST API for a simple e-commerce flow: **manage products, add items to a cart, and check out** into an order, with automatic stock deduction. Built with **Node.js**, **Express 5**, **Prisma ORM**, and **MySQL**.

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-5.x-2D3748?logo=prisma&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1?logo=mysql&logoColor=white)
![License](https://img.shields.io/badge/License-ISC-blue)

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database Schema](#-database-schema)
- [API Reference](#-api-reference)
- [Example Workflow](#-example-workflow)
- [Troubleshooting](#-troubleshooting)
- [Roadmap](#-roadmap)
- [Author](#-author)

---

## ✨ Features

- **User management**: create users and list them (carts and orders belong to a user)
- **Product management**: create products and list them, with input validation
- **Cart management**: add products to a user's cart; adding the same product again increases its quantity (upsert)
- **Cart retrieval**: fetch a user's cart with full product details
- **Checkout**: converts a cart into an order inside a **database transaction**:
    - validates the cart is not empty
    - validates stock for every item
    - calculates the order total
    - creates the order and its line items (price snapshot per item)
    - decrements product stock
    - clears the cart
- **Safe checkout**: stock is deducted atomically inside the transaction, so concurrent orders can't oversell
- Input validation with clear `400` / `404` / `409` responses and a global error handler
- Modular structure: each feature (`user`, `product`, `cart`, `checkout`) has its own routes and controller
- CORS enabled for frontend integration

---

## 🛠 Tech Stack

| Layer      | Technology           |
| ---------- | -------------------- |
| Runtime    | Node.js (ES Modules) |
| Framework  | Express `^5.3.0`     |
| ORM        | Prisma `^5.22.0`     |
| Database   | MySQL                |
| Config     | dotenv               |
| Middleware | cors, express.json   |

---

## 📁 Project Structure

```
QuickCart-Api/
├── prisma/
│   ├── migrations/
│   │   ├── 20261108234716_init/
│   │   │   └── migration.sql
│   │   └── migration_lock.toml
│   └── schema.prisma             # User, Product, CartItem, Order, OrderItem
├── src/
│   ├── config/
│   │   └── db.js                 # Shared PrismaClient instance
│   ├── user/
│   │   ├── userController.js
│   │   └── userRoutes.js
│   ├── utils/
│   │   └── validate.js
│   ├── product/
│   │   ├── productController.js
│   │   └── productRoutes.js
│   ├── cart/
│   │   ├── cartController.js
│   │   └── cartRoutes.js
│   ├── checkout/
│   │   ├── checkoutController.js
│   │   └── checkoutRoutes.js
│   └── app.js                    # Express app & route mounting
├── server.js                     # Entry point
├── requests.http                 # Sample requests (VS Code REST Client)
├── .env.example
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- A running [MySQL](https://dev.mysql.com/downloads/) server

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/M-sohaib-Hafeez/QuickCart-Api.git
cd QuickCart-Api

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.example .env
# then edit .env with your MySQL credentials

# 4. Create the database (in MySQL)
#    CREATE DATABASE quickcart_db;

# 5. Apply migrations and generate the Prisma client
npx prisma migrate deploy
npx prisma generate

# 6. Start the server
npm start
```

The server runs at **http://localhost:3001** by default.

### Create a user first

The cart and orders belong to a `User`, so create one before using the cart or checkout:

```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com"}'
```

The first user gets `id = 1`.

---

## 🔐 Environment Variables

| Variable       | Required | Description                      | Example                                                 |
| -------------- | -------- | -------------------------------- | ------------------------------------------------------- |
| `PORT`         | No       | Server port (defaults to `3001`) | `3001`                                                  |
| `DATABASE_URL` | **Yes**  | MySQL connection string          | `mysql://user:yourpassword@localhost:3306/quickcart_db` |

> Never commit your real `.env` file. It is already in `.gitignore`.

---

## 🗄 Database Schema

```
User ──< CartItem >── Product
  │                      │
  └──< Order ──< OrderItem >──┘
```

| Model       | Key fields                                                                 | Notes                                 |
| ----------- | -------------------------------------------------------------------------- | ------------------------------------- |
| `User`      | `id`, `name`, `email` (unique)                                             | Owns a cart and orders                |
| `Product`   | `id`, `name`, `price`, `stock` (default `0`)                               |                                       |
| `CartItem`  | `id`, `userId`, `productId`, `quantity` (default `1`)                      | **Unique** on (`userId`, `productId`) |
| `Order`     | `id`, `userId`, `totalAmount`, `status` (default `COMPLETED`), `createdAt` |                                       |
| `OrderItem` | `id`, `orderId`, `productId`, `quantity`, `price`                          | `price` is a snapshot at purchase time |

---

## 📡 API Reference

**Base URL:** `http://localhost:3001`

| Method | Endpoint                | Description                       |
| ------ | ----------------------- | --------------------------------- |
| `GET`  | `/`                     | Welcome message                   |
| `POST` | `/api/users`            | Create a user                     |
| `GET`  | `/api/users`            | List all users                    |
| `POST` | `/api/products`         | Create a product                  |
| `GET`  | `/api/products`         | List all products                 |
| `POST` | `/api/cart`             | Add a product to a user's cart    |
| `GET`  | `/api/cart/:userId`     | Get a user's cart (with products) |
| `POST` | `/api/checkout/:userId` | Check out the user's cart         |

### Users

**`POST /api/users`**

```json
{ "name": "Test User", "email": "test@example.com" }
```

| Status | Meaning                              |
| ------ | ------------------------------------ |
| `201`  | User created                         |
| `400`  | `name` or `email` missing            |
| `409`  | A user with that email already exists |

**`GET /api/users`** returns `200 OK` with an array of users.

### Products

**`POST /api/products`**

```json
{
  "name": "Gaming Laptop",
  "price": 1200.00,
  "stock": 5
}
```

Response `201 Created`:

```json
{ "id": 1, "name": "Gaming Laptop", "price": 1200, "stock": 5 }
```

**`GET /api/products`** returns `200 OK` with an array of products.

### Cart

**`POST /api/cart`**

| Field       | Type    | Description                                   |
| ----------- | ------- | --------------------------------------------- |
| `userId`    | integer | Must be an existing user                      |
| `productId` | integer | Must be an existing product                   |
| `quantity`  | integer | Amount to add (increments if already in cart) |

```json
{ "userId": 1, "productId": 1, "quantity": 2 }
```

Response `200 OK`:

```json
{ "id": 1, "userId": 1, "productId": 1, "quantity": 2 }
```

Errors: `400` for invalid IDs/quantity, `404` if the user or product doesn't exist.

**`GET /api/cart/:userId`** returns `200 OK`:

```json
[
  {
    "id": 1,
    "userId": 1,
    "productId": 1,
    "quantity": 2,
    "product": { "id": 1, "name": "Gaming Laptop", "price": 1200, "stock": 5 }
  }
]
```

### Checkout

**`POST /api/checkout/:userId`** (no body)

| Status | Meaning                                    |
| ------ | ------------------------------------------ |
| `201`  | Order placed successfully                  |
| `404`  | Cart is empty                              |
| `400`  | Insufficient stock for one of the products |
| `500`  | Checkout failed due to a server error      |

Success response:

```json
{
  "message": "Order placed successfully",
  "order": {
    "id": 1,
    "userId": 1,
    "totalAmount": 2475,
    "status": "COMPLETED",
    "createdAt": "2026-11-09T10:15:30.123Z"
  }
}
```

---

## 🔁 Example Workflow

The repo includes [`requests.http`](requests.http) for the VS Code [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) extension. The flow is:

1. `POST /api/users`: create a user
2. `POST /api/products`: add a few products
3. `POST /api/cart`: add items for `userId: 1`
4. `GET /api/cart/1`: verify the cart contents
5. `POST /api/checkout/1`: place the order
6. `GET /api/products`: stock should be reduced
7. `GET /api/cart/1`: cart should now be empty

### cURL

```bash
curl -X POST http://localhost:3001/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Wireless Mouse","price":25,"stock":20}'

curl -X POST http://localhost:3001/api/cart \
  -H "Content-Type: application/json" \
  -d '{"userId":1,"productId":1,"quantity":3}'

curl http://localhost:3001/api/cart/1

curl -X POST http://localhost:3001/api/checkout/1
```

---

## 🩺 Troubleshooting

| Symptom                                                              | Likely cause                                                                  |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `POST /api/cart` returns `404`                                       | The `userId` or `productId` doesn't exist. Create the user and product first  |
| `GET /api/cart/:userId` returns `[]`                                 | Nothing has been added for that user yet                                      |
| Checkout returns `500`                                               | Check the server console (`checkout failed ...`) for the Prisma error         |
| `Cannot find module '.prisma/client'`                                | Run `npx prisma generate`                                                     |
| `Can't reach database server`                                        | Check `DATABASE_URL` and that MySQL is running                                |

---

## 🗺 Roadmap

- [ ] Authentication (JWT) instead of passing `userId` directly
- [ ] Update/remove cart items and clear cart
- [ ] Order history endpoints (`GET /api/orders`, admin order view)
- [ ] Store money as `Decimal` instead of `Float`
- [ ] Automated tests (Jest/Vitest + Supertest)
- [ ] Swagger / OpenAPI docs

---

## 👤 Author

**Muhammad Sohaib Hafeez**

- GitHub: [@M-sohaib-Hafeez](https://github.com/M-sohaib-Hafeez)

## 📄 License

ISC