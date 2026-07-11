# Backend Architecture

Stack: FastAPI + synchronous PyMongo + MongoDB.

## Layers

Strict layer split: routers → services → `db.py`.

- **Routers** (`app/routers/`) — HTTP concerns only: parse the request via
  Pydantic models, pick the status code, wire `Depends(require_user)` /
  `Depends(require_admin)` for auth. No business logic, no PyMongo calls.
- **Services** (`app/services/`) — plain business-logic functions that take a
  Mongo collection plus validated data and return plain dicts/values. No
  FastAPI imports.
- **`db.py`** — the only module that talks to PyMongo. Holds the client and
  exposes typed accessors, `get_users()` and `get_vehicles()`, each
  returning a `pymongo.collection.Collection`.

Rule: routers never touch PyMongo; services never import FastAPI.

```python
# app/routers/vehicles.py — router: HTTP concerns only
@router.post("/api/vehicles", status_code=201)
def create_vehicle(payload: VehicleCreate, user=Depends(require_user)):
    return vehicle_service.create_vehicle(db.get_vehicles(), payload.model_dump())

# app/services/vehicle_service.py — service: plain function, no FastAPI
def create_vehicle(collection, data: dict) -> dict:
    ...  # business logic, returns a plain dict
```

`import fastapi` must not appear under `app/services/`; `pymongo` must not
appear under `app/routers/`.

## PyMongo runtime

Use synchronous PyMongo with plain `def` endpoints. FastAPI runs `def`
endpoints in a threadpool.

## Project layout

Backend layout tree — reused verbatim by Tasks 2–5:

```
backend/
├── app/
│   ├── main.py          # FastAPI app, CORS, router mounting
│   ├── routers/auth.py, routers/vehicles.py
│   ├── services/auth_service.py, services/vehicle_service.py
│   ├── models.py        # Pydantic request/response models
│   ├── db.py            # PyMongo client + collection accessors
│   ├── security.py      # bcrypt hash/verify, JWT create/decode, require_user/require_admin deps
│   └── seed_admin.py    # python -m app.seed_admin
└── tests/
```

## TDD strategy

Use pytest and a Red → Green → Refactor cycle per feature slice, with one
commit per step.

- **Red** — write a failing test first.
- **Green** — write the minimal code to make it pass.
- **Refactor** — clean up the implementation while the test stays green.

**Test levels:**

- **Service-level unit tests** call service functions directly, against a
  real test database, `car_dealership_test`, which a pytest fixture drops
  before/after each test run.
- **Endpoint tests** go through FastAPI's `TestClient`, exercising the full
  router → service → `db.py` path.
Use a real test database; do not mock Mongo.

## Not included

- Docker.
- Async Motor.
- A repository abstraction over PyMongo.
