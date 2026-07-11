import os

import certifi
from dotenv import load_dotenv
from pymongo import MongoClient


load_dotenv()
_mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/car_dealership")
# tlsCAFile implicitly enables TLS in pymongo, so it's only passed for
# mongodb+srv:// (Atlas) URIs, never for a plain local mongodb:// connection.
_tls_kwargs = {"tlsCAFile": certifi.where()} if _mongo_uri.startswith("mongodb+srv://") else {}
_client = MongoClient(_mongo_uri, **_tls_kwargs)


def get_database():
    return _client.get_default_database(default="car_dealership")


def get_users():
    users = get_database()["users"]
    users.create_index("email", unique=True)
    return users


def get_vehicles():
    vehicles = get_database()["vehicles"]
    for field in ("make", "model", "category", "price"):
        vehicles.create_index(field)
    return vehicles


def get_orders():
    orders = get_database()["orders"]
    orders.create_index("user_id")
    orders.create_index([("created_at", -1)])
    return orders
