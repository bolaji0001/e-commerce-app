# # [Store Name]: Full-Stack E-Commerce App

A full-stack online store: browse products, build a cart, create an account, and place orders. Payments with Stripe are in progress.

**Live demo:** [https://e-commerce-app-three-pink.vercel.app/](https://e-commerce-app-three-pink.vercel.app/) · **API:** [https://e-commerce-app-d533.onrender.com/health](https://e-commerce-app-d533.onrender.com/health)

_(The API runs on a free tier and can take up to a minute to wake up on the first request.)_

![Screenshot](C:\Users\USER\Desktop\e-commerce-app\Screenshot.png)

## Features

- Product catalogue with search
- Shopping cart saved in the browser
- Register and log in (bcrypt password hashing, JWT)
- Orders with prices and totals calculated on the server
- Order history for each user
- Rate limiting on login and sign-up

**In progress:** Stripe Checkout and webhooks, admin product management, automated tests, CI.

## Tech stack

| Layer | Technology |

|---|---|

| Frontend | React, TypeScript, Vite, Tailwind CSS, React Router |

| Backend | Node.js, Express, TypeScript, Zod |

| Database | PostgreSQL (Neon in production, Docker locally) |

| Auth | bcrypt, JSON Web Tokens |

| Hosting | Vercel (web), Render (API), Neon (database) |

## Architecture

Browser (React) → REST API (Express) → PostgreSQL

- The cart lives in the browser. Prices are **never** trusted from the client: the API looks them up and calculates totals when an order is created.
- Orders are created in a database transaction, so an order and its items are saved together or not at all.

## API endpoints

| Method | Path | Auth | Description |

|---|---|---|---|

| GET | /health | no | API and database status |

| GET | /products?q=&limit=&offset= | no | List/search products |

| GET | /products/:id | no | One product |

| POST | /auth/register | no | Create an account |

| POST | /auth/login | no | Log in, returns a JWT |

| GET | /auth/me | yes | Current user |

| POST | /orders | yes | Create an order from product ids and quantities |

| GET | /orders | yes | Your orders |

| GET | /orders/:id | yes | One of your orders |

## Run locally

Requires Node.js 20+ and Docker.

```bash

docker compose up -d                     # local PostgreSQL

cd apps/api

cp .env.example .env                     # then set JWT_SECRET

npm install

npm run migrate && npm run seed

npm run dev                              # [http://localhost:4000](http://localhost:4000)

cd ../web

cp .env.example .env

npm install

npm run dev                              # [http://localhost:5173](http://localhost:5173)

```

## Key decisions

- **Money is stored as integer cents** to avoid rounding errors.
- **Order items store the unit price at purchase time**, so old orders never change when prices change.
- **Stock is checked at order time and will be reduced atomically when payment succeeds.**
- **JWT in localStorage** for simplicity; an httpOnly cookie would be the next security upgrade.

## Roadmap

- [ ] Stripe Checkout and webhook

- [ ] Admin product management

- [ ] Jest and Playwright tests, GitHub Actions CIMy Store: E-Commerce App
