# Backend — Car Dealership Inventory System

Split from `context.md` (2026-07-10). Stack: FARMN backend portion (exact mapping TBD — confirm with user before implementation).

## Requirements

- RESTful API using the chosen FARMN technologies.
- Persistent database (PostgreSQL, MongoDB, or SQLite) — in-memory is not sufficient.
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
- Open decisions: auth details, validation/error contract, how the first admin is created, testing tools, first RGR slice.
