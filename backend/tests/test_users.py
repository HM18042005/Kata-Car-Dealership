from app.db import get_users


def _register(client, email="buyer@example.com", password="hunter2"):
    response = client.post("/api/auth/register", json={"email": email, "password": password})
    return response.json()["id"]


def test_list_users_requires_admin(client, auth_headers):
    response = client.get("/api/users", headers=auth_headers)
    assert response.status_code == 403


def test_list_users_without_a_token_returns_401(client):
    response = client.get("/api/users")
    assert response.status_code == 401


def test_list_users_as_admin_returns_all_users(client, admin_headers):
    _register(client, email="buyer@example.com")
    response = client.get("/api/users", headers=admin_headers)
    assert response.status_code == 200
    emails = {user["email"] for user in response.json()}
    assert emails == {"admin@example.com", "buyer@example.com"}


def test_promote_user_sets_role_to_admin(client, admin_headers):
    user_id = _register(client, email="buyer@example.com")
    response = client.post(f"/api/users/{user_id}/promote", headers=admin_headers)
    assert response.status_code == 200
    assert response.json()["role"] == "admin"


def test_promote_is_idempotent(client, admin_headers):
    user_id = _register(client, email="buyer@example.com")
    client.post(f"/api/users/{user_id}/promote", headers=admin_headers)
    response = client.post(f"/api/users/{user_id}/promote", headers=admin_headers)
    assert response.status_code == 200
    assert response.json()["role"] == "admin"


def test_promote_an_unknown_user_returns_404(client, admin_headers):
    response = client.post("/api/users/665f1c1a2b3c4d5e6f7a8b9d/promote", headers=admin_headers)
    assert response.status_code == 404


def test_promote_as_a_regular_user_returns_403(client, auth_headers):
    response = client.post("/api/users/665f1c1a2b3c4d5e6f7a8b9d/promote", headers=auth_headers)
    assert response.status_code == 403


def test_demote_user_sets_role_to_user(client, admin_headers):
    other_admin_id = get_users().insert_one(
        {"email": "other-admin@example.com", "password_hash": "x", "role": "admin"}
    ).inserted_id
    response = client.post(f"/api/users/{other_admin_id}/demote", headers=admin_headers)
    assert response.status_code == 200
    assert response.json()["role"] == "user"


def test_demote_rejects_self_targeting(client, admin_headers):
    admin = get_users().find_one({"email": "admin@example.com"})
    response = client.post(f"/api/users/{admin['_id']}/demote", headers=admin_headers)
    assert response.status_code == 403


def test_demote_an_unknown_user_returns_404(client, admin_headers):
    response = client.post("/api/users/665f1c1a2b3c4d5e6f7a8b9d/demote", headers=admin_headers)
    assert response.status_code == 404


def test_delete_user_removes_them(client, admin_headers):
    user_id = _register(client, email="buyer@example.com")
    response = client.delete(f"/api/users/{user_id}", headers=admin_headers)
    assert response.status_code == 204
    assert get_users().find_one({"email": "buyer@example.com"}) is None


def test_delete_rejects_self_targeting(client, admin_headers):
    admin = get_users().find_one({"email": "admin@example.com"})
    response = client.delete(f"/api/users/{admin['_id']}", headers=admin_headers)
    assert response.status_code == 403


def test_delete_an_unknown_user_returns_404(client, admin_headers):
    response = client.delete("/api/users/665f1c1a2b3c4d5e6f7a8b9d", headers=admin_headers)
    assert response.status_code == 404


def test_delete_as_a_regular_user_returns_403(client, auth_headers):
    response = client.delete("/api/users/665f1c1a2b3c4d5e6f7a8b9d", headers=auth_headers)
    assert response.status_code == 403
