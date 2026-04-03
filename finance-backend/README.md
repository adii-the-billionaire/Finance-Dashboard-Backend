# Finance dashboard backend

Node.js backend for a finance dashboard: **REST** and **GraphQL** APIs, **MongoDB** persistence (Mongoose), **role-based access control**, validation (Zod), and **mock bearer-token authentication** suitable for local development.

## Live deployment links (submission)

> **Update this block** if you change Render service name or GitHub repo.

| Resource | URL |
|----------|-----|
| **GitHub** | https://github.com/adii-the-billionaire/Finance-Dashboard-Backend |
| **API base** | https://finance-dashboard-backend-30yg.onrender.com |
| **Health** | https://finance-dashboard-backend-30yg.onrender.com/health |
| **Root / API index** | https://finance-dashboard-backend-30yg.onrender.com/ |
| **REST** | https://finance-dashboard-backend-30yg.onrender.com/api/v1 |
| **Swagger UI** | https://finance-dashboard-backend-30yg.onrender.com/api-docs |
| **OpenAPI JSON** | https://finance-dashboard-backend-30yg.onrender.com/openapi.json |
| **GraphQL (POST)** | https://finance-dashboard-backend-30yg.onrender.com/graphql |

**Demo login (after seed):** `POST /api/v1/auth/login` with `{"email":"admin@seed.local"}` → use returned `token` as `Authorization: Bearer …`.

---

## Directory layout

```
finance-backend/
├── package.json
├── .env.example
├── README.md
└── src/
    ├── server.js                 # Process entry: DB connect + HTTP listen
    ├── app.js                    # Express + Apollo wiring, global middleware
    ├── config/
    │   ├── env.js                # Environment loading / defaults
    │   └── database.js           # Mongoose connection
    ├── constants/
    │   └── roles.js              # Roles, statuses, capability matrix
    ├── errors/
    │   └── AppError.js           # Operational HTTP-style errors
    ├── models/
    │   ├── User.model.js
    │   └── FinancialRecord.model.js
    ├── services/                 # Business logic (used by REST + GraphQL)
    │   ├── auth.service.js
    │   ├── user.service.js
    │   ├── financialRecord.service.js
    │   └── dashboard.service.js
    ├── controllers/              # Thin HTTP handlers → services
    ├── routes/                   # REST routers + rate limit on auth
    ├── middleware/
    │   ├── authenticate.js       # Bearer mock-JWT → req.authUser
    │   ├── requireCapability.js  # RBAC for REST
    │   ├── errorHandler.js
    │   └── validateRequest.js
    ├── validators/
    │   └── schemas.js            # Zod schemas (shared)
    ├── graphql/
    │   ├── typeDefs.js
    │   ├── resolvers.js
    │   ├── context.js
    │   └── authz.js
    ├── utils/
    │   └── mockJwt.js            # HMAC-signed demo token (not JWT-standard)
    ├── docs/
    │   └── openapi.json          # OpenAPI 3 spec (Swagger UI at /api-docs)
    └── scripts/
        └── seed.js               # Demo users + sample records
```

Design goals: **routes stay thin**, **services own rules and persistence**, **shared validation** for REST and GraphQL, **capabilities** derived from a single role matrix in `constants/roles.js`.

## Assumptions

1. **Authentication** is **mock**: `POST /api/v1/auth/login` with `{ "email" }` returns an HMAC-signed token (payload: user id + role). Production would use real passwords/OAuth and standard JWT libraries with expiry and rotation.
2. **Authorization** is **role → capability**:
   - **VIEWER**: dashboard summaries only; **cannot** list or read individual financial records via `/records` or GraphQL `financialRecords` / `financialRecord`.
   - **ANALYST**: read records + dashboard; **cannot** create/update/delete records or manage users.
   - **ADMIN**: full CRUD on records, user management, dashboard.
3. **Data is global**: there is no per-tenant or per-user row scoping; all active users see the same financial dataset except where VIEWER is blocked from raw record endpoints (they still see **aggregates and recent activity** on the dashboard summary).
4. **Deletes** are **soft** (`isDeleted`, `deletedAt`); listing excludes deleted rows.
5. **MongoDB** is the default store; URI comes from `MONGODB_URI`.

## Setup

Requirements: **Node.js 18+**, **MongoDB** reachable at `MONGODB_URI`.

```bash
cd finance-backend
cp .env.example .env
npm install
npm run seed    # optional: demo users *@seed.local + sample rows
npm run dev     # or npm start
```

- Health: `GET /health`
- REST prefix: `/api/v1`
- GraphQL: `POST /graphql`
- **API docs (Swagger UI):** `GET /api-docs`
- **OpenAPI JSON (import into Postman / Insomnia):** `GET /openapi.json`

## Mock login

```http
POST /api/v1/auth/login
Content-Type: application/json

{ "email": "admin@seed.local" }
```

Response includes `token`. Send:

```http
Authorization: Bearer <token>
```

## REST API (summary)

| Method | Path | Capability | Description |
|--------|------|------------|-------------|
| POST | `/auth/login` | — | Issue token |
| GET | `/users` | `canManageUsers` | List users |
| GET | `/users/:id` | `canManageUsers` | Get user |
| POST | `/users` | `canManageUsers` | Create user |
| PATCH | `/users/:id` | `canManageUsers` | Update user |
| GET | `/records` | `canListRecords` | Filter + **pagination** (`page`, `limit`, `type`, `category`, `dateFrom`, `dateTo`) |
| GET | `/records/:id` | `canReadRecordDetail` | Get one record |
| POST | `/records` | `canCreateRecord` | Create record |
| PATCH | `/records/:id` | `canUpdateRecord` | Update record |
| DELETE | `/records/:id` | `canDeleteRecord` | Soft delete |
| GET | `/dashboard/summary` | `canViewDashboard` | Totals, category breakdown, recent activity, trends |

**Status codes**: `401` missing/invalid token; `403` forbidden role; `400` validation/invalid id; `404` missing entity; `409` duplicate email; `500` unexpected.

## GraphQL

Same auth header as REST. Root operations mirror REST with `Query` / `Mutation` names in `src/graphql/typeDefs.js`. Unauthorized or under-privileged calls return GraphQL errors with extensions (`APP_ERROR`, `BAD_USER_INPUT` for Zod).

Example:

```graphql
query {
  dashboardSummary(input: { recentLimit: 5, trendGranularity: monthly }) {
    totals { netBalance totalIncome totalExpenses }
    recentActivity { id amount category type }
  }
}
```

## Optional enhancements included

- **Rate limiting** on `/api/v1/auth` (express-rate-limit).
- **Pagination** on record listing.
- **Soft delete** for financial records.
- **Structured validation** and central **error** formatting.

## Deploying live (so you can share a URL)

Use any Node host (Render, Railway, Fly.io, etc.) plus a **cloud MongoDB** (e.g. [MongoDB Atlas](https://www.mongodb.com/atlas))—your laptop MongoDB is not reachable from the public internet.

1. **Atlas:** Create a cluster → Database Access (user + password) → Network Access → allow `0.0.0.0/0` (or the host’s egress IPs for tighter security). Copy the **SRV connection string** and set the database name (e.g. `finance_dashboard`).
2. **Host (example: Render):** New **Web Service** → connect the repo → **Build:** `npm install` → **Start:** `npm start`. Set environment variables:
   - `MONGODB_URI` = Atlas URI  
   - `MOCK_JWT_SECRET` = long random string (required for signing tokens in production)  
   - `NODE_ENV` = `production` (enables `trust proxy` behind the load balancer)
3. **After first deploy:** Open **Render Shell** (or your host’s equivalent) and run `node src/scripts/seed.js` once so demo users exist (same emails as local, e.g. `admin@seed.local`).
4. **Links to submit** — see **[Live deployment links](#live-deployment-links-submission)** at the top of this file (same URLs as repo root `README.md`).

If this app lives inside the **monorepo** (`Project/finance-backend`), the Render Blueprint is **`render.yaml` in the repository root** (parent folder). You still must set **`MONGODB_URI`** in the Render dashboard after the service is created.

**Postman:** Import → **Link** → paste your **`/openapi.json`** URL from the table above.

## Tradeoffs

- **Mock token** trades real security for simplicity; secret must be rotated for anything beyond local demos.
- **VIEWER** sees **recent activity** embedded in dashboard (aggregated UX) but cannot hit record CRUD or list endpoints—clear separation without duplicating two dashboard types.
- **Weekly trends** use Mongo `$dateToString` with ISO week format; semantics are UTC-based.

## License

MIT
