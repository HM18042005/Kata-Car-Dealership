import re
from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId


class VehicleNotFoundError(Exception):
    pass


class OutOfStockError(Exception):
    pass


def create_vehicle(vehicles, data: dict) -> dict:
    now = datetime.now(timezone.utc)
    vehicle = {**data, "created_at": now, "updated_at": now}
    vehicle["_id"] = vehicles.insert_one(vehicle).inserted_id
    return serialize_vehicle(vehicle)


def list_vehicles(vehicles) -> list[dict]:
    return [serialize_vehicle(vehicle) for vehicle in vehicles.find()]


def search_vehicles(
    vehicles,
    make: str | None = None,
    model: str | None = None,
    category: str | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
) -> list[dict]:
    query = {}
    if make:
        query["make"] = {"$regex": re.escape(make), "$options": "i"}
    if model:
        query["model"] = {"$regex": re.escape(model), "$options": "i"}
    if category:
        query["category"] = category
    if min_price is not None or max_price is not None:
        query["price"] = {
            **({"$gte": min_price} if min_price is not None else {}),
            **({"$lte": max_price} if max_price is not None else {}),
        }
    return [serialize_vehicle(vehicle) for vehicle in vehicles.find(query)]


def update_vehicle(vehicles, vehicle_id: str, data: dict) -> dict:
    updated = vehicles.find_one_and_update(
        {"_id": _object_id(vehicle_id)},
        {"$set": {**data, "updated_at": datetime.now(timezone.utc)}},
        return_document=True,
    )
    if updated is None:
        raise VehicleNotFoundError
    return serialize_vehicle(updated)


def delete_vehicle(vehicles, vehicle_id: str) -> None:
    if not vehicles.delete_one({"_id": _object_id(vehicle_id)}).deleted_count:
        raise VehicleNotFoundError


def purchase_vehicle(vehicles, vehicle_id: str) -> dict:
    object_id = _object_id(vehicle_id)
    updated = vehicles.find_one_and_update(
        {"_id": object_id, "quantity": {"$gt": 0}},
        {"$inc": {"quantity": -1}, "$set": {"updated_at": datetime.now(timezone.utc)}},
        return_document=True,
    )
    if updated is not None:
        return serialize_vehicle(updated)
    if vehicles.find_one({"_id": object_id}) is None:
        raise VehicleNotFoundError
    raise OutOfStockError


def restock_vehicle(vehicles, vehicle_id: str, amount: int) -> dict:
    updated = vehicles.find_one_and_update(
        {"_id": _object_id(vehicle_id)},
        {"$inc": {"quantity": amount}, "$set": {"updated_at": datetime.now(timezone.utc)}},
        return_document=True,
    )
    if updated is None:
        raise VehicleNotFoundError
    return serialize_vehicle(updated)


def serialize_vehicle(vehicle: dict) -> dict:
    return {
        "id": str(vehicle["_id"]),
        "make": vehicle["make"],
        "model": vehicle["model"],
        "category": vehicle["category"],
        "price": vehicle["price"],
        "quantity": vehicle["quantity"],
    }


def _object_id(value: str) -> ObjectId:
    try:
        return ObjectId(value)
    except (InvalidId, TypeError):
        raise VehicleNotFoundError from None
