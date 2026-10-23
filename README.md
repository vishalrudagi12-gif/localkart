# LocalBazaar

Digital marketplace for local sellers: products, inventory, orders, and a customer storefront.

## Stack

- **Backend:** Spring Boot 3, Spring Security + JWT, Spring Data JPA, MySQL, Spring Mail
- **Frontend:** React (Vite), Tailwind CSS, Redux Toolkit, React Router
- **Roles:** Customer, Seller, Admin

## Repo layout

```
localbazaar/
  backend/     Spring Boot API (port 8080)
  frontend/    React app (port 5173)
  docker-compose.yml   MySQL 8
```

## Prerequisites

- JDK 17
- Node.js 20+
- Git
- Docker (optional, for MySQL) **or** a local MySQL 8 instance

## Run locally

1. Start MySQL (`docker compose up -d` from this folder).
2. Copy `backend/src/main/resources/application.yml` values if your DB user/password differ.
3. Backend: `cd backend` then `./mvnw spring-boot:run` (Windows: `mvnw.cmd spring-boot:run`).
4. Frontend: `cd frontend` then `npm install` and `npm run dev`.
5. Open http://localhost:5173

## API (planned)

| Prefix | Purpose |
| --- | --- |
| `/api/auth` | Register, login, email verify |
| `/api/products` | Product CRUD + search |
| `/api/orders` | Place, accept/reject, track |
| `/api/dashboard` | Seller/admin analytics |
| `/api/admin` | Approve sellers, users |

## Build order (we follow this)

1. Project skeleton (this step)
2. Auth (JWT) + roles
3. Seller products + images + inventory
4. Customer catalog, cart, checkout
5. Orders + status emails
6. Dashboards + recommendations
7. Payments (Razorpay/Stripe sandbox, optional)
