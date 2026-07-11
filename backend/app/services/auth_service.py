from datetime import datetime, timezone

from pymongo.errors import DuplicateKeyError

from app.security import hash_password, verify_password


_DUMMY_PASSWORD_HASH = "$2b$12$3GUGYf/YlETNMIpMCq9yM.0fUpsKoF8aNZFeQcHne.ctUZKjorlGS"


class EmailAlreadyRegisteredError(Exception):
    pass


class InvalidCredentialsError(Exception):
    pass


class AdminEmailTakenError(Exception):
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


def serialize_user(user: dict) -> dict:
    return {"id": str(user["_id"]), "email": user["email"], "role": user["role"]}
