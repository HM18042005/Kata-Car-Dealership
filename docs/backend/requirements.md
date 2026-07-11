# Backend — Car Dealership Inventory System

Stack: FastAPI + MongoDB. See `architecture.md` for the backend layout.

## Requirements

- RESTful API using FastAPI.
- Persistent database (MongoDB chosen) — in-memory is not sufficient.
- User registration and login.
- Token-based auth (e.g. JWT) for protected endpoints.
- Two roles: regular user and admin.

## Endpoints

Authentication:

- `POST /api/auth/register`
- `POST /api/auth/login`

Vehicles (protected):

- `POST /api/vehicles` — add a vehicle.
- `GET /api/vehicles` — list all available vehicles.
- `GET /api/vehicles/search` — search by make, model, category, or price range.
- `PUT /api/vehicles/:id` — update vehicle details.
- `DELETE /api/vehicles/:id` — delete a vehicle; admin only.

Inventory (protected):

- `POST /api/vehicles/:id/purchase` — purchase one and decrease quantity.
- `POST /api/vehicles/:id/restock` — increase quantity; admin only.

## Vehicle model

Unique ID, make, model, category, price, quantity in stock.

## Process

- TDD: tests before implementation; visible Red-Green-Refactor story in commit history, especially for backend logic.
- Meaningful behavior/edge-case tests, not coverage padding.
- Auth and first-admin rules: `security.md`; validation/error contract:
  `api.md` and `services.md`; testing strategy: `architecture.md`.
