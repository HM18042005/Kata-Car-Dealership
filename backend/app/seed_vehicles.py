"""Seed the vehicles collection with sample inventory.

Usage:
    python -m app.seed_vehicles

Idempotent — skips if vehicles already exist in the collection.
Prices are in INR (₹). Each category has 5 brands with realistic models
and a random quantity between 10 and 50.
"""

import random
from datetime import datetime, timezone

from dotenv import load_dotenv

from app.db import get_vehicles

load_dotenv()

# 5 brands per category with (make, model, price_inr)
VEHICLE_DATA = {
    "sedan": [
        ("Maruti Suzuki", "Ciaz", 1200000),
        ("Hyundai", "Verna", 1100000),
        ("Honda", "City", 1300000),
        ("Tata", "Tigor", 800000),
        ("Skoda", "Slavia", 1400000),
    ],
    "suv": [
        ("Tata", "Harrier", 1800000),
        ("Mahindra", "XUV700", 1600000),
        ("Hyundai", "Creta", 1200000),
        ("Kia", "Seltos", 1150000),
        ("MG", "Hector", 1500000),
    ],
    "hatchback": [
        ("Maruti Suzuki", "Swift", 700000),
        ("Hyundai", "i20", 800000),
        ("Tata", "Altroz", 750000),
        ("Toyota", "Glanza", 720000),
        ("Volkswagen", "Polo", 850000),
    ],
    "truck": [
        ("Tata", "Intra V30", 750000),
        ("Mahindra", "Bolero Pickup", 850000),
        ("Ashok Leyland", "Dost+", 900000),
        ("Isuzu", "D-Max V-Cross", 2200000),
        ("Force", "Gurkha Pickup", 1500000),
    ],
    "coupe": [
        ("BMW", "2 Series Gran Coupe", 4200000),
        ("Mercedes-Benz", "C-Class Coupe", 5500000),
        ("Audi", "A5 Sportback", 5000000),
        ("Hyundai", "Ioniq 6", 4500000),
        ("Lexus", "RC", 6000000),
    ],
    "convertible": [
        ("BMW", "Z4", 7500000),
        ("Mercedes-Benz", "AMG SL", 15000000),
        ("Porsche", "718 Boxster", 9500000),
        ("Audi", "A5 Cabriolet", 7000000),
        ("Mini", "Cooper Convertible", 4500000),
    ],
    "van": [
        ("Maruti Suzuki", "Eeco", 550000),
        ("Tata", "Winger", 1200000),
        ("Force", "Traveller", 1600000),
        ("Mahindra", "Marazzo", 1400000),
        ("Toyota", "Innova Crysta", 2000000),
    ],
    "electric": [
        ("Tata", "Nexon EV", 1500000),
        ("MG", "ZS EV", 2200000),
        ("Hyundai", "Ioniq 5", 4500000),
        ("BYD", "Atto 3", 3400000),
        ("Mahindra", "XUV400 EV", 1600000),
    ],
}


def seed_vehicles() -> None:
    vehicles = get_vehicles()

    if vehicles.count_documents({}) > 0:
        print(f"Vehicles collection already has {vehicles.count_documents({})} documents. Skipping seed.")
        return

    docs = []
    now = datetime.now(timezone.utc)

    for category, cars in VEHICLE_DATA.items():
        for make, model, price in cars:
            docs.append(
                {
                    "make": make,
                    "model": model,
                    "category": category,
                    "price": price,
                    "quantity": random.randint(10, 50),
                    "created_at": now,
                    "updated_at": now,
                }
            )

    result = vehicles.insert_many(docs)
    print(f"Seeded {len(result.inserted_ids)} vehicles across 8 categories (prices in INR).")


if __name__ == "__main__":
    seed_vehicles()
