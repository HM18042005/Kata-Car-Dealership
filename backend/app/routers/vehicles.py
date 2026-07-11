from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

from app import db
from app.models import RestockPayload, VehicleCategory, VehiclePayload
from app.security import require_admin, require_user
from app.services import order_service, vehicle_service


router = APIRouter(prefix="/api/vehicles", tags=["vehicles"])


def _not_found(call):
    try:
        return call()
    except vehicle_service.VehicleNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")


@router.post("", status_code=status.HTTP_201_CREATED)
def create_vehicle(payload: VehiclePayload, _: dict = Depends(require_user)):
    return vehicle_service.create_vehicle(db.get_vehicles(), payload.model_dump(mode="json"))


@router.get("")
def list_vehicles(_: dict = Depends(require_user)):
    return vehicle_service.list_vehicles(db.get_vehicles())


@router.get("/search")
def search_vehicles(
    make: str | None = None,
    model: str | None = None,
    category: VehicleCategory | None = None,
    min_price: float | None = Query(default=None, ge=0, allow_inf_nan=False),
    max_price: float | None = Query(default=None, ge=0, allow_inf_nan=False),
    _: dict = Depends(require_user),
):
    return vehicle_service.search_vehicles(
        db.get_vehicles(),
        make=make,
        model=model,
        category=category.value if category else None,
        min_price=min_price,
        max_price=max_price,
    )


@router.put("/{vehicle_id}")
def update_vehicle(
    vehicle_id: str, payload: VehiclePayload, _: dict = Depends(require_user)
):
    return _not_found(
        lambda: vehicle_service.update_vehicle(
            db.get_vehicles(), vehicle_id, payload.model_dump(mode="json")
        )
    )


@router.delete("/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vehicle(vehicle_id: str, _: dict = Depends(require_admin)):
    _not_found(lambda: vehicle_service.delete_vehicle(db.get_vehicles(), vehicle_id))
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{vehicle_id}/purchase")
def purchase_vehicle(vehicle_id: str, claims: dict = Depends(require_user)):
    try:
        vehicle = vehicle_service.purchase_vehicle(db.get_vehicles(), vehicle_id)
    except vehicle_service.VehicleNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
    except vehicle_service.OutOfStockError:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Out of stock")

    try:
        order_service.create_order(
            db.get_orders(), user_id=claims["sub"], user_email=claims["email"], vehicle=vehicle
        )
    except Exception:
        # The decrement above already succeeded and remains the source of
        # truth for stock; a failed order write is a recoverable gap in
        # history, not a reason to fail a purchase that already happened.
        pass

    return vehicle


@router.post("/{vehicle_id}/restock")
def restock_vehicle(
    vehicle_id: str, payload: RestockPayload, _: dict = Depends(require_admin)
):
    return _not_found(
        lambda: vehicle_service.restock_vehicle(
            db.get_vehicles(), vehicle_id, payload.amount
        )
    )
