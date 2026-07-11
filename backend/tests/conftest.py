import os
from datetime import datetime, timezone

os.environ.setdefault("SECRET_KEY", "test-secret-key-that-is-at-least-32-bytes")
os.environ.setdefault("MONGO_URI", "mongodb://localhost:27017/car_dealership_test")
os.environ.setdefault("ADMIN_EMAIL", "admin@example.com")
os.environ.setdefault("ADMIN_PASSWORD", "test-admin-password")

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.db import get_users, get_vehicles
from app.security import create_access_token, hash_password


@pytest.fixture(autouse=True)
def clean_db():
    database = get_users().database
    database.client.drop_database(database.name)
    yield
    database.client.drop_database(database.name)


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def user_token(client):
    client.post(
        "/api/auth/register",
        json={"email": "buyer@example.com", "password": "hunter2"},
    )
    response = client.post(
        "/api/auth/login",
        json={"email": "buyer@example.com", "password": "hunter2"},
    )
    return response.json()["access_token"]


@pytest.fixture
def auth_headers(user_token):
    return {"Authorization": f"Bearer {user_token}"}


@pytest.fixture
def admin_token():
    result = get_users().insert_one(
        {
            "email": "admin@example.com",
            "password_hash": hash_password("adminpass123"),
            "role": "admin",
            "created_at": datetime.now(timezone.utc),
        }
    )
    return create_access_token({"sub": str(result.inserted_id), "role": "admin"})


@pytest.fixture
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture
def sample_vehicle():
    result = get_vehicles().insert_one(
        {
            "make": "Toyota",
            "model": "Corolla",
            "category": "sedan",
            "price": 21000,
            "quantity": 3,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }
    )
    return str(result.inserted_id)
