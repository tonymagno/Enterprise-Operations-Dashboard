from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.crud.role import (
    get_roles,
    get_role,
    create_role,
    update_role,
    delete_role,
)
from app.schemas.role import (
    RoleCreate,
    RoleUpdate,
    RoleResponse,
)

router = APIRouter(
    prefix="/roles",
    tags=["Roles"],
)


@router.get("/", response_model=list[RoleResponse])
def list_roles(
    db: Session = Depends(get_db)
):
    return get_roles(db)


@router.get("/{role_id}", response_model=RoleResponse)
def get_role_by_id(
    role_id: int,
    db: Session = Depends(get_db)
):
    role = get_role(db, role_id)

    if not role:
        raise HTTPException(
            status_code=404,
            detail="Role not found"
        )

    return role


@router.post("/", response_model=RoleResponse)
def create_new_role(
    role: RoleCreate,
    db: Session = Depends(get_db)
):
    return create_role(db, role)


@router.put("/{role_id}", response_model=RoleResponse)
def update_existing_role(
    role_id: int,
    role: RoleUpdate,
    db: Session = Depends(get_db)
):
    updated_role = update_role(
        db,
        role_id,
        role
    )

    if not updated_role:
        raise HTTPException(
            status_code=404,
            detail="Role not found"
        )

    return updated_role


@router.delete("/{role_id}")
def remove_role(
    role_id: int,
    db: Session = Depends(get_db)
):
    deleted = delete_role(
        db,
        role_id
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Role not found"
        )

    return {
        "message": "Role deleted successfully"
    }