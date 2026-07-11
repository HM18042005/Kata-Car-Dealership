from app.db import get_vehicles


def test_purchase_decrements_quantity_by_one(client, auth_headers, sample_vehicle):
    response = client.post(f"/api/vehicles/{sample_vehicle}/purchase", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["quantity"] == 2


def test_purchase_without_a_token_returns_401(client, sample_vehicle):
    response = client.post(f"/api/vehicles/{sample_vehicle}/purchase")
    assert response.status_code == 401


def test_purchase_an_unknown_vehicle_returns_404(client, auth_headers):
    response = client.post(
        "/api/vehicles/665f1c1a2b3c4d5e6f7a8b9d/purchase", headers=auth_headers
    )
    assert response.status_code == 404


def test_purchase_out_of_stock_vehicle_returns_409(client, auth_headers):
    result = get_vehicles().insert_one(
        {
            "make": "Toyota",
            "model": "Corolla",
            "category": "sedan",
            "price": 21000,
            "quantity": 0,
        }
    )
    response = client.post(
        f"/api/vehicles/{result.inserted_id}/purchase", headers=auth_headers
    )
    assert response.status_code == 409
    assert response.json()["detail"] == "Out of stock"


def test_restock_increments_quantity_by_the_given_amount(
    client, admin_headers, sample_vehicle
):
    response = client.post(
        f"/api/vehicles/{sample_vehicle}/restock",
        json={"amount": 5},
        headers=admin_headers,
    )
    assert response.status_code == 200
    assert response.json()["quantity"] == 8


def test_restock_without_a_token_returns_401(client, sample_vehicle):
    response = client.post(
        f"/api/vehicles/{sample_vehicle}/restock", json={"amount": 5}
    )
    assert response.status_code == 401


def test_restock_as_a_regular_user_returns_403(client, auth_headers, sample_vehicle):
    response = client.post(
        f"/api/vehicles/{sample_vehicle}/restock",
        json={"amount": 5},
        headers=auth_headers,
    )
    assert response.status_code == 403


def test_restock_an_unknown_vehicle_returns_404(client, admin_headers):
    response = client.post(
        "/api/vehicles/665f1c1a2b3c4d5e6f7a8b9d/restock",
        json={"amount": 5},
        headers=admin_headers,
    )
    assert response.status_code == 404


def test_restock_with_a_zero_amount_returns_422(client, admin_headers, sample_vehicle):
    response = client.post(
        f"/api/vehicles/{sample_vehicle}/restock",
        json={"amount": 0},
        headers=admin_headers,
    )
    assert response.status_code == 422


def test_restock_with_a_negative_amount_returns_422(client, admin_headers, sample_vehicle):
    response = client.post(
        f"/api/vehicles/{sample_vehicle}/restock",
        json={"amount": -1},
        headers=admin_headers,
    )
    assert response.status_code == 422
