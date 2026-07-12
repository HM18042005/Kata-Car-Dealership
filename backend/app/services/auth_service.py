from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId
from pymongo.errors import DuplicateKeyError

from app.security import hash_password, verify_password


_DUMMY_PASSWORD_HASH = "$2b$12$3GUGYf/YlETNMIpMCq9yM.0fUpsKoF8aNZFeQcHne.ctUZKjorlGS"


class EmailAlreadyRegisteredError(Exception):
    pass


class InvalidCredentialsError(Exception):
    pass


class AdminEmailTakenError(Exception):
    pass


class UserNotFoundError(Exception):
    pass


class CannotModifySelfError(Exception):
    pass


def register_user(users, email: str, password: str) -> dict:
    if users.find_one({"email": email}):
        raise EmailAlreadyRegisteredError

    user = {
        "email": email,
        "password_hash": hash_password(password),
        "role": "user",
        "created_at": datetime.now(timezone.utc),
    }
    try:
        user["_id"] = users.insert_one(user).inserted_id
    except DuplicateKeyError:
        raise EmailAlreadyRegisteredError from None
    return serialize_user(user)


def authenticate_user(users, email: str, password: str) -> dict:
    user = users.find_one({"email": email})
    password_matches = verify_password(
        password, user["password_hash"] if user else _DUMMY_PASSWORD_HASH
    )
    if not user or not password_matches:
        raise InvalidCredentialsError
    return user


def seed_admin(users, email: str, password: str) -> bool:
    if not email.strip():
        raise ValueError("ADMIN_EMAIL must not be blank")
    if (
        not password.strip()
        or len(password) < 6
        or password.strip().lower() == "change-me"
    ):
        raise ValueError("ADMIN_PASSWORD must be at least 6 characters and not a placeholder")

    existing = users.find_one({"email": email})
    if existing:
        if existing.get("role") != "admin":
            raise AdminEmailTakenError
        return False
    try:
        users.insert_one(
            {
                "email": email,
                "password_hash": hash_password(password),
                "role": "admin",
                "created_at": datetime.now(timezone.utc),
            }
        )
    except DuplicateKeyError:
        existing = users.find_one({"email": email})
        if not existing or existing.get("role") != "admin":
            raise AdminEmailTakenError from None
        return False
    return True


def list_users(users) -> list[dict]:
    return [serialize_user(user) for user in users.find()]


def promote_user(users, user_id: str) -> dict:
    updated = users.find_one_and_update(
        {"_id": _object_id(user_id)},
        {"$set": {"role": "admin"}},
        return_document=True,
    )
    if updated is None:
        raise UserNotFoundError
    return serialize_user(updated)


def demote_user(users, user_id: str, caller_id: str) -> dict:
    if user_id == caller_id:
        raise CannotModifySelfError
    updated = users.find_one_and_update(
        {"_id": _object_id(user_id)},
        {"$set": {"role": "user"}},
        return_document=True,
    )
    if updated is None:
        raise UserNotFoundError
    return serialize_user(updated)


def delete_user(users, user_id: str, caller_id: str) -> None:
    if user_id == caller_id:
        raise CannotModifySelfError
    if not users.delete_one({"_id": _object_id(user_id)}).deleted_count:
        raise UserNotFoundError


def serialize_user(user: dict) -> dict:
    return {"id": str(user["_id"]), "email": user["email"], "role": user["role"]}


def _object_id(value: str) -> ObjectId:
    try:
        return ObjectId(value)
    except (InvalidId, TypeError):
        raise UserNotFoundError from None
