from app.db import get_vehicles

VEHICLE_PAYLOAD = {
    "make": "Toyota",
    "model": "Corolla",
    "category": "sedan",
    "price": 21000,
    "quantity": 3,
}


def test_create_vehicle_returns_201_with_the_submitted_fields(client, auth_headers):
    response = client.post("/api/vehicles", json=VEHICLE_PAYLOAD, headers=auth_headers)
    assert response.status_code == 201
    body = response.json()
    assert body["make"] == "Toyota"
    assert body["quantity"] == 3
    assert "id" in body


def test_create_vehicle_without_a_token_returns_401(client):
    response = client.post("/api/vehicles", json=VEHICLE_PAYLOAD)
    assert response.status_code == 401


def test_create_vehicle_with_an_invalid_category_returns_422(client, auth_headers):
    payload = {**VEHICLE_PAYLOAD, "category": "spaceship"}
    response = client.post("/api/vehicles", json=payload, headers=auth_headers)
    assert response.status_code == 422


def test_create_vehicle_with_a_negative_price_returns_422(client, auth_headers):
    payload = {**VEHICLE_PAYLOAD, "price": -100}
    response = client.post("/api/vehicles", json=payload, headers=auth_headers)
    assert response.status_code == 422


def test_create_vehicle_with_a_negative_quantity_returns_422(client, auth_headers):
    payload = {**VEHICLE_PAYLOAD, "quantity": -1}
    response = client.post("/api/vehicles", json=payload, headers=auth_headers)
    assert response.status_code == 422


def test_list_vehicles_returns_all_vehicles(client, auth_headers, sample_vehicle):
    response = client.get("/api/vehicles", headers=auth_headers)
    assert response.status_code == 200
    ids = [vehicle["id"] for vehicle in response.json()]
    assert sample_vehicle in ids


def test_list_vehicles_without_a_token_returns_401(client):
    response = client.get("/api/vehicles")
    assert response.status_code == 401


def test_search_filters_by_category(client, auth_headers, sample_vehicle):
    get_vehicles().insert_one(
        {**VEHICLE_PAYLOAD, "make": "Honda", "model": "CR-V", "category": "suv"}
    )
    response = client.get("/api/vehicles/search?category=suv", headers=auth_headers)
    assert response.status_code == 200
    categories = {vehicle["category"] for vehicle in response.json()}
    assert categories == {"suv"}


def test_search_matches_make_case_insensitively(client, auth_headers, sample_vehicle):
    response = client.get("/api/vehicles/search?make=TOYOTA", headers=auth_headers)
    assert response.status_code == 200
    makes = [vehicle["make"] for vehicle in response.json()]
    assert "Toyota" in makes


def test_search_filters_by_price_range(client, auth_headers, sample_vehicle):
    get_vehicles().insert_one(
        {
            **VEHICLE_PAYLOAD,
            "make": "Honda",
            "model": "CR-V",
            "category": "suv",
            "price": 28500,
        }
    )
    response = client.get(
        "/api/vehicles/search?min_price=25000&max_price=30000", headers=auth_headers
    )
    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    assert body[0]["make"] == "Honda"


def test_search_with_no_params_behaves_like_list(client, auth_headers, sample_vehicle):
    response = client.get("/api/vehicles/search", headers=auth_headers)
    assert response.status_code == 200
    ids = [vehicle["id"] for vehicle in response.json()]
    assert sample_vehicle in ids


def test_search_with_a_non_numeric_min_price_returns_422(client, auth_headers):
    response = client.get("/api/vehicles/search?min_price=cheap", headers=auth_headers)
    assert response.status_code == 422


def test_search_with_an_unknown_category_returns_422(client, auth_headers):
    response = client.get("/api/vehicles/search?category=spaceship", headers=auth_headers)
    assert response.status_code == 422


def test_search_without_a_token_returns_401(client):
    response = client.get("/api/vehicles/search")
    assert response.status_code == 401


def test_update_vehicle_returns_200_with_the_new_values(client, auth_headers, sample_vehicle):
    payload = {**VEHICLE_PAYLOAD, "price": 22000}
    response = client.put(
        f"/api/vehicles/{sample_vehicle}", json=payload, headers=auth_headers
    )
    assert response.status_code == 200
    assert response.json()["price"] == 22000


def test_update_vehicle_without_a_token_returns_401(client, sample_vehicle):
    response = client.put(f"/api/vehicles/{sample_vehicle}", json=VEHICLE_PAYLOAD)
    assert response.status_code == 401


def test_update_an_unknown_vehicle_returns_404(client, auth_headers):
    response = client.put(
        "/api/vehicles/665f1c1a2b3c4d5e6f7a8b9d",
        json=VEHICLE_PAYLOAD,
        headers=auth_headers,
    )
    assert response.status_code == 404


def test_update_with_an_invalid_category_returns_422(client, auth_headers, sample_vehicle):
    payload = {**VEHICLE_PAYLOAD, "category": "spaceship"}
    response = client.put(
        f"/api/vehicles/{sample_vehicle}", json=payload, headers=auth_headers
    )
    assert response.status_code == 422


def test_delete_vehicle_as_admin_returns_204(client, admin_headers, sample_vehicle):
    response = client.delete(f"/api/vehicles/{sample_vehicle}", headers=admin_headers)
    assert response.status_code == 204


def test_deleted_vehicle_is_no_longer_listed(
    client, admin_headers, auth_headers, sample_vehicle
):
    client.delete(f"/api/vehicles/{sample_vehicle}", headers=admin_headers)
    response = client.get("/api/vehicles", headers=auth_headers)
    ids = [vehicle["id"] for vehicle in response.json()]
    assert sample_vehicle not in ids


def test_delete_vehicle_as_a_regular_user_returns_403(client, auth_headers, sample_vehicle):
    response = client.delete(f"/api/vehicles/{sample_vehicle}", headers=auth_headers)
    assert response.status_code == 403


def test_delete_an_unknown_vehicle_returns_404(client, admin_headers):
    response = client.delete(
        "/api/vehicles/665f1c1a2b3c4d5e6f7a8b9d", headers=admin_headers
    )
    assert response.status_code == 404


def test_delete_vehicle_without_a_token_returns_401(client, sample_vehicle):
    response = client.delete(f"/api/vehicles/{sample_vehicle}")
    assert response.status_code == 401
