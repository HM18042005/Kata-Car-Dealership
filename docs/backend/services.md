# Backend Services

Business rules and initial Red-Green-Refactor test cases.

## Validation split

- **Pydantic models** (`app/models.py`) validate shape, types, and ranges
  that are knowable from the request body alone: `price >= 0`,
  `quantity >= 0`, `category` is one of the 8-value enum, `email` is a
  well-formed address. Invalid bodies return `422`.
- **Services** (`app/services/`) enforce rules that need the database or
  the authenticated caller's identity to evaluate: is this email already
  taken, does this vehicle id exist, is the caller `admin`, is there stock
  left to sell.

## Register

**Rule:** duplicate email is rejected with `409`; the password is never
stored in plaintext, only its bcrypt hash; the `role` field on the created
user is always `"user"`, regardless of anything in the request body.

**Tests:**

- registering with an email that already exists returns `409`.
- the stored `password_hash` is not equal to the plaintext password (and
  verifies via bcrypt against it).
- a register request that includes `"role": "admin"` in the body still
  creates a user with `role: "user"`.

## Login

**Rule:** an unknown email and a correct-email-wrong-password both return
`401` with the same error message; a successful login returns a JWT whose
claims include `sub` (the user id) and `role`.

**Tests:**

- login with an unregistered email and login with a registered email plus
  the wrong password both return `401` with an identical `detail` message.
- on success, decoding the returned `access_token` yields a payload whose
  `sub` matches the user's id and whose `role` matches the user's stored
  role.

## Purchase

**Rule:** `quantity > 0` on the target vehicle decrements it by one and
returns the updated vehicle (`200`); `quantity == 0` returns `409` with
`"Out of stock"`; an unknown `id` returns `404`.

A `None` result from `find_one_and_update` requires an existence check:
missing vehicle returns `404`; zero stock returns `409`.

**Tests:**

- purchasing a vehicle with `quantity > 0` returns `200` with the
  decremented vehicle.
- purchasing a vehicle already at `quantity: 0` returns `409` with detail
  `"Out of stock"`.
- a vehicle starting at `quantity: 3` reads `quantity: 2` after one
  purchase.
- purchasing an `id` with no matching vehicle returns `404`.

## Restock

**Rule:** admin-only — a `user` caller gets `403`; the request body's
`amount` must be `>= 1` (`422` otherwise, at the Pydantic layer); a valid
request increments `quantity` by `amount` and returns the updated vehicle.

**Tests:**

- a `user`-role caller hitting restock gets `403`.
- a request with `amount: -1` (or `0`) is rejected with `422`.
- a vehicle at `quantity: 2` restocked with `amount: 5` reads `quantity: 7`.

## Delete

**Rule:** admin-only; success returns `204` with no body; an unknown `id`
returns `404`.

**Tests:**

- a `user`-role caller hitting delete gets `403`.
- an `admin` caller deleting an existing vehicle gets `204`.
- after that delete, the vehicle is no longer present in the `vehicles`
  collection (a subsequent lookup finds nothing).

## Update

**Rule:** `PUT /api/vehicles/{id}` replaces the full vehicle document; an
unknown `id` returns `404`; the request body is validated with the same
Pydantic model (and therefore the same constraints) as create.

**Tests:**

- updating an existing vehicle with a valid full body returns `200` with
  the new values.
- updating an unknown `id` returns `404`.
- a body with an invalid `category` value (not in the 8-value enum) returns
  `422`.

## Not included

- Purchase history or orders collection.
- Soft delete.
