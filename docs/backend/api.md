# Backend API

HTTP contract for the nine API endpoints.

## Conventions

Base path: `/api`. Use JSON request/response bodies and
`Authorization: Bearer <jwt>` on protected routes. Errors use FastAPI's
default shape:

```json
{ "detail": "Vehicle not found" }
```

## Endpoint reference

Each endpoint includes auth, request, response, and error contracts.

### 1. `POST /api/auth/register`

**Auth:** none

**Request:**

```json
{ "email": "buyer@example.com", "password": "hunter2" }
```

**Response `201`:**

```json
{ "id": "665f1c1a2b3c4d5e6f7a8b9c", "email": "buyer@example.com", "role": "user" }
```

**Errors:**

| Status | Condition |
|---|---|
| 409 | email already registered |
| 422 | invalid body (malformed email, missing/short password) |

### 2. `POST /api/auth/login`

**Auth:** none

**Request:**

```json
{ "email": "buyer@example.com", "password": "hunter2" }
```

**Response `200`:**

```json
{ "access_token": "<jwt>", "token_type": "bearer" }
```

**Errors:**

| Status | Condition |
|---|---|
| 401 | bad credentials (unknown email or wrong password) |

### 3. `POST /api/vehicles`

**Auth:** user

**Request:**

```json
{ "make": "Toyota", "model": "Corolla", "category": "sedan", "price": 21000, "quantity": 3 }
```

**Response `201`:**

```json
{ "id": "665f1c1a2b3c4d5e6f7a8b9d", "make": "Toyota", "model": "Corolla", "category": "sedan", "price": 21000, "quantity": 3 }
```

**Errors:**

| Status | Condition |
|---|---|
| 401 | missing/invalid bearer token |
| 422 | invalid body (bad `category` enum value, negative `price`/`quantity`) |

### 4. `GET /api/vehicles`

**Auth:** user

**Request:** none (no body, no query params — full listing).

**Response `200`:**

```json
[
  { "id": "665f1c1a2b3c4d5e6f7a8b9d", "make": "Toyota", "model": "Corolla", "category": "sedan", "price": 21000, "quantity": 3 },
  { "id": "665f1c1a2b3c4d5e6f7a8b9e", "make": "Honda", "model": "CR-V", "category": "suv", "price": 28500, "quantity": 1 }
]
```

**Errors:**

| Status | Condition |
|---|---|
| 401 | missing/invalid bearer token |

### 5. `GET /api/vehicles/search`

**Auth:** user

**Request:** none (no body — filters via query params, see the Search
section below).

**Response `200`:**

```json
[
  { "id": "665f1c1a2b3c4d5e6f7a8b9e", "make": "Honda", "model": "CR-V", "category": "suv", "price": 28500, "quantity": 1 }
]
```

**Errors:**

| Status | Condition |
|---|---|
| 401 | missing/invalid bearer token |
| 422 | bad params (non-numeric `min_price`/`max_price`, unknown `category` value) |

### 6. `PUT /api/vehicles/{id}`

**Auth:** user

**Request:** full vehicle body.

```json
{ "make": "Toyota", "model": "Corolla", "category": "sedan", "price": 22000, "quantity": 3 }
```

**Response `200`:**

```json
{ "id": "665f1c1a2b3c4d5e6f7a8b9d", "make": "Toyota", "model": "Corolla", "category": "sedan", "price": 22000, "quantity": 3 }
```

**Errors:**

| Status | Condition |
|---|---|
| 401 | missing/invalid bearer token |
| 404 | no vehicle with that `id` |
| 422 | invalid body |

### 7. `DELETE /api/vehicles/{id}`

**Auth:** admin

**Request:** none (no body — `id` is a path param).

**Response `204`:** no body.

**Errors:**

| Status | Condition |
|---|---|
| 401 | missing/invalid bearer token |
| 403 | authenticated as `user`, not `admin` |
| 404 | no vehicle with that `id` |

### 8. `POST /api/vehicles/{id}/purchase`

**Auth:** user

**Request:** none (no body — buys exactly one unit of `id`).

**Response `200`:** updated vehicle after the decrement:

```json
{ "id": "665f1c1a2b3c4d5e6f7a8b9d", "make": "Toyota", "model": "Corolla", "category": "sedan", "price": 22000, "quantity": 2 }
```

**Errors:**

| Status | Condition |
|---|---|
| 401 | missing/invalid bearer token |
| 404 | no vehicle with that `id` |
| 409 | out of stock (`quantity` was already `0`) |

### 9. `POST /api/vehicles/{id}/restock`

**Auth:** admin

**Request:** increment amount:

```json
{ "amount": 5 }
```

**Response `200`:** updated vehicle:

```json
{ "id": "665f1c1a2b3c4d5e6f7a8b9d", "make": "Toyota", "model": "Corolla", "category": "sedan", "price": 22000, "quantity": 8 }
```

**Errors:**

| Status | Condition |
|---|---|
| 401 | missing/invalid bearer token |
| 403 | authenticated as `user`, not `admin` |
| 404 | no vehicle with that `id` |
| 422 | invalid body (`amount` missing, zero, or negative) |

## Search

`GET /api/vehicles/search` accepts five optional query params. Combine
provided params with AND; no params behave like `GET /api/vehicles`.

| Param | Type | Matches |
|---|---|---|
| `make` | string | case-insensitive match on `make` |
| `model` | string | case-insensitive match on `model` |
| `category` | string (enum) | exact match on `category` |
| `min_price` | number | `price >= min_price` |
| `max_price` | number | `price <= max_price` |

`make` and `model` match case-insensitively.

**Example:**

```
GET /api/vehicles/search?category=suv&max_price=30000
```

## Not included

- Pagination.
- `PATCH /api/vehicles/{id}`.
- API versioning.
