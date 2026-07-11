import pytest

from app.db import get_users
from app.security import decode_access_token, verify_password
from app.services.auth_service import AdminEmailTakenError, seed_admin


def test_register_returns_201_with_id_email_and_user_role(client):
    response = client.post(
        "/api/auth/register",
        json={"email": "buyer@example.com", "password": "hunter2"},
    )
    assert response.status_code == 201
    body = response.json()
    assert body["email"] == "buyer@example.com"
    assert body["role"] == "user"
    assert "id" in body


def test_register_ignores_a_requested_admin_role(client):
    response = client.post(
        "/api/auth/register",
        json={"email": "buyer@example.com", "password": "hunter2", "role": "admin"},
    )
    assert response.status_code == 201
    assert response.json()["role"] == "user"


def test_register_stores_a_bcrypt_hash_not_the_plaintext_password(client):
    client.post(
        "/api/auth/register",
        json={"email": "buyer@example.com", "password": "hunter2"},
    )
    stored = get_users().find_one({"email": "buyer@example.com"})
    assert stored["password_hash"] != "hunter2"
    assert verify_password("hunter2", stored["password_hash"]) is True


def test_register_with_a_taken_email_returns_409(client):
    client.post(
        "/api/auth/register",
        json={"email": "buyer@example.com", "password": "hunter2"},
    )
    response = client.post(
        "/api/auth/register",
        json={"email": "buyer@example.com", "password": "different"},
    )
    assert response.status_code == 409


def test_register_with_a_malformed_email_returns_422(client):
    response = client.post(
        "/api/auth/register",
        json={"email": "not-an-email", "password": "hunter2"},
    )
    assert response.status_code == 422


def test_register_with_a_missing_password_returns_422(client):
    response = client.post("/api/auth/register", json={"email": "buyer@example.com"})
    assert response.status_code == 422


def test_login_returns_a_bearer_token_on_success(client):
    client.post(
        "/api/auth/register",
        json={"email": "buyer@example.com", "password": "hunter2"},
    )
    response = client.post(
        "/api/auth/login",
        json={"email": "buyer@example.com", "password": "hunter2"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]

    stored = get_users().find_one({"email": "buyer@example.com"})
    payload = decode_access_token(body["access_token"])
    assert payload["sub"] == str(stored["_id"])
    assert payload["role"] == stored["role"]
    assert payload["email"] == stored["email"]


def test_login_with_an_unknown_email_returns_401(client):
    response = client.post(
        "/api/auth/login",
        json={"email": "nobody@example.com", "password": "hunter2"},
    )
    assert response.status_code == 401


def test_login_with_the_wrong_password_returns_the_same_401_message_as_an_unknown_email(
    client,
):
    client.post(
        "/api/auth/register",
        json={"email": "buyer@example.com", "password": "hunter2"},
    )
    wrong_password = client.post(
        "/api/auth/login",
        json={"email": "buyer@example.com", "password": "wrong"},
    )
    unknown_email = client.post(
        "/api/auth/login",
        json={"email": "nobody@example.com", "password": "hunter2"},
    )
    assert wrong_password.status_code == 401
    assert wrong_password.json()["detail"] == unknown_email.json()["detail"]


def test_seed_admin_is_idempotent():
    users = get_users()
    assert seed_admin(users, "admin@example.com", "adminpass123") is True
    assert seed_admin(users, "admin@example.com", "adminpass123") is False
    assert users.count_documents({"email": "admin@example.com", "role": "admin"}) == 1


def test_seed_admin_rejects_a_regular_users_email(client):
    client.post(
        "/api/auth/register",
        json={"email": "buyer@example.com", "password": "hunter2"},
    )
    with pytest.raises(AdminEmailTakenError):
        seed_admin(get_users(), "buyer@example.com", "adminpass123")


def test_seed_admin_rejects_the_example_password():
    with pytest.raises(ValueError):
        seed_admin(get_users(), "admin@example.com", "change-me")
