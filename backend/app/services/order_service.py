from datetime import datetime, timezone


def create_order(orders, *, user_id: str, user_email: str, vehicle: dict) -> dict:
    order = {
        "user_id": user_id,
        "user_email": user_email,
        "vehicle_id": vehicle["id"],
        "make": vehicle["make"],
        "model": vehicle["model"],
        "category": vehicle["category"],
        "price": vehicle["price"],
        "quantity": 1,
        "created_at": datetime.now(timezone.utc),
    }
    order["_id"] = orders.insert_one(order).inserted_id
    return serialize_order(order)


def list_orders_for_user(orders, user_id: str) -> list[dict]:
    cursor = orders.find({"user_id": user_id}).sort("created_at", -1)
    return [serialize_order(order) for order in cursor]


def list_all_orders(orders) -> list[dict]:
    cursor = orders.find().sort("created_at", -1)
    return [serialize_order(order) for order in cursor]


def serialize_order(order: dict) -> dict:
    return {
        "id": str(order["_id"]),
        "user_id": order["user_id"],
        "user_email": order["user_email"],
        "vehicle_id": order["vehicle_id"],
        "make": order["make"],
        "model": order["model"],
        "category": order["category"],
        "price": order["price"],
        "quantity": order["quantity"],
        "created_at": order["created_at"].isoformat(),
    }
