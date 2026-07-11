from enum import Enum

from pydantic import BaseModel, EmailStr, Field


class VehicleCategory(str, Enum):
    sedan = "sedan"
    suv = "suv"
    hatchback = "hatchback"
    truck = "truck"
    coupe = "coupe"
    convertible = "convertible"
    van = "van"
    electric = "electric"


class RegisterPayload(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)


class LoginPayload(BaseModel):
    email: EmailStr
    password: str


class VehiclePayload(BaseModel):
    make: str = Field(min_length=1)
    model: str = Field(min_length=1)
    category: VehicleCategory
    price: float = Field(ge=0, allow_inf_nan=False)
    quantity: int = Field(ge=0)


class RestockPayload(BaseModel):
    amount: int = Field(ge=1)
