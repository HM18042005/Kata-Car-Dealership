from fastapi import APIRouter, Depends

from app import db
from app.security import require_admin, require_user
from app.services import order_service


router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.get("")
def list_my_orders(claims: dict = Depends(require_user)):
    return order_service.list_orders_for_user(db.get_orders(), claims["sub"])


@router.get("/all")
def list_all_orders(_: dict = Depends(require_admin)):
    return order_service.list_all_orders(db.get_orders())
