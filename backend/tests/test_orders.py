from datetime import datetime, timedelta, timezone

from app.db import get_orders, get_users


def _insert_order(user_id, user_email, created_at=None, **overrides):
    order = {
        "user_id": user_id,
        "user_email": user_email,
        "vehicle_id": "665f1c1a2b3c4d5e6f7a8b9d",
        "make": "Toyota",
        "model": "Corolla",
        "category": "sedan",
        "price": 21000,
        "quantity": 1,
        "created_at": created_at or datetime.now(timezone.utc),
        **overrides,
    }
    return get_orders().insert_one(order).inserted_id


def test_list_my_orders_returns_only_the_callers_orders(client, auth_headers):
    buyer = get_users().find_one({"email": "buyer@example.com"})
    _insert_order(str(buyer["_id"]), "buyer@example.com")
    _insert_order("someone-elses-id", "other@example.com")

    response = client.get("/api/orders", headers=auth_headers)

    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    assert body[0]["user_email"] == "buyer@example.com"


def test_list_my_orders_returns_newest_first(client, auth_headers):
    buyer = get_users().find_one({"email": "buyer@example.com"})
    older = datetime.now(timezone.utc) - timedelta(days=1)
    _insert_order(str(buyer["_id"]), "buyer@example.com", created_at=older, model="Old One")
    _insert_order(str(buyer["_id"]), "buyer@example.com", model="New One")

    response = client.get("/api/orders", headers=auth_headers)

    assert response.status_code == 200
    models = [order["model"] for order in response.json()]
    assert models == ["New One", "Old One"]


def test_list_my_orders_without_a_token_returns_401(client):
    response = client.get("/api/orders")
    assert response.status_code == 401


def test_list_all_orders_as_admin_returns_every_order(client, admin_headers):
    _insert_order("user-1", "one@example.com")
    _insert_order("user-2", "two@example.com")

    response = client.get("/api/orders/all", headers=admin_headers)

    assert response.status_code == 200
    emails = {order["user_email"] for order in response.json()}
    assert emails == {"one@example.com", "two@example.com"}


def test_list_all_orders_as_a_regular_user_returns_403(client, auth_headers):
    response = client.get("/api/orders/all", headers=auth_headers)
    assert response.status_code == 403


def test_list_all_orders_without_a_token_returns_401(client):
    response = client.get("/api/orders/all")
    assert response.status_code == 401
