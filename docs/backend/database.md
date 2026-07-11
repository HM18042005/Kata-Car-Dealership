# Backend Database

MongoDB collections, indexes, ID handling, and atomic inventory updates.
`db.py` is the only module that talks to PyMongo.

## Storage

Use MongoDB through synchronous PyMongo. Collections: `users` and
`vehicles`.

## Collections

**`users`:** `_id`, `email` (unique index), `password_hash`, `role`,
`created_at`.

Example document:

```json
{
  "_id": ObjectId("665f1c1a2b3c4d5e6f7a8b9c"),
  "email": "buyer@example.com",
  "password_hash": "$2b$12$KIXQ...hashvalue...",
  "role": "user",
  "created_at": ISODate("2026-07-10T12:00:00Z")
}
```

**`vehicles`:** `_id`, `make`, `model`, `category`, `price`, `quantity`,
`created_at`, `updated_at`.

Example document:

```json
{
  "_id": ObjectId("665f1c1a2b3c4d5e6f7a8b9d"),
  "make": "Toyota",
  "model": "Corolla",
  "category": "sedan",
  "price": 21000,
  "quantity": 3,
  "created_at": ISODate("2026-07-10T12:00:00Z"),
  "updated_at": ISODate("2026-07-10T12:00:00Z")
}
```

`category` is one of the 8-value enum from the Vehicle JSON contract
(`sedan | suv | hatchback | truck | coupe | convertible | van | electric`),
matching the icon set in `frontend/svgs/`. `password_hash` never leaves this
collection — the register response returns `id`, `email`, `role` only.

## Indexes

- `users.email` — unique index.
- `vehicles.make`, `vehicles.model`, `vehicles.category`, `vehicles.price`
  — single-field indexes.

Create indexes:

```python
db.get_users().create_index("email", unique=True)
db.get_vehicles().create_index("make")
db.get_vehicles().create_index("model")
db.get_vehicles().create_index("category")
db.get_vehicles().create_index("price")
```

Not included: compound indexes and a `make`/`model` text index.

## ID strategy

Use MongoDB `ObjectId` as internal `_id`; expose
`str(document["_id"])` as the 24-character API `id`. Parse path params
with `ObjectId(id)`; invalid or absent IDs return `404`.

## Atomic purchase

Purchase uses one atomic `find_one_and_update`:

```python
from pymongo import ReturnDocument

collection.find_one_and_update(
    {"_id": vehicle_id, "quantity": {"$gt": 0}},
    {"$inc": {"quantity": -1}},
    return_document=ReturnDocument.AFTER
)
```

Use `ReturnDocument.AFTER` so the response contains the decremented vehicle.
If the update returns `None`, check existence: missing id returns `404`;
zero stock returns `409`.

## Not included

- Multi-document transactions.
- Migration tooling.
