from fastapi import APIRouter, HTTPException, status

from app import db
from app.models import LoginPayload, RegisterPayload
from app.security import create_access_token
from app.services import auth_service


router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(payload: RegisterPayload):
    try:
        return auth_service.register_user(
            db.get_users(), str(payload.email), payload.password
        )
    except auth_service.EmailAlreadyRegisteredError:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")


@router.post("/login")
def login(payload: LoginPayload):
    try:
        user = auth_service.authenticate_user(
            db.get_users(), str(payload.email), payload.password
        )
    except auth_service.InvalidCredentialsError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return {
        "access_token": create_access_token(
            {"sub": str(user["_id"]), "role": user["role"], "email": user["email"]}
        ),
        "token_type": "bearer",
    }
