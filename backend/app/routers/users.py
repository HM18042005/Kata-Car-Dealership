from fastapi import APIRouter, Depends, HTTPException, Response, status

from app import db
from app.security import require_admin
from app.services import auth_service


router = APIRouter(prefix="/api/users", tags=["users"])


def _not_found(call):
    try:
        return call()
    except auth_service.UserNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")


@router.get("")
def list_users(_: dict = Depends(require_admin)):
    return auth_service.list_users(db.get_users())


@router.post("/{user_id}/promote")
def promote_user(user_id: str, _: dict = Depends(require_admin)):
    return _not_found(lambda: auth_service.promote_user(db.get_users(), user_id))


@router.post("/{user_id}/demote")
def demote_user(user_id: str, claims: dict = Depends(require_admin)):
    try:
        return auth_service.demote_user(db.get_users(), user_id, claims["sub"])
    except auth_service.CannotModifySelfError:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot demote your own account")
    except auth_service.UserNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: str, claims: dict = Depends(require_admin)):
    try:
        auth_service.delete_user(db.get_users(), user_id, claims["sub"])
    except auth_service.CannotModifySelfError:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot delete your own account")
    except auth_service.UserNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
