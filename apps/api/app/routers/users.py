from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    status,
)

from sqlalchemy.orm import Session

from app.db.session import get_db

from app.dependencies.auth import (
    get_current_user,
    require_role,
)

from app.crud.user import (
    get_users,
    get_user_by_id,
    create_user,
    update_user,
    delete_user,
)

from app.schemas.user import (
    UserResponse,
    UserCreate,
    UserUpdate,
)

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


@router.get("/me")
async def read_current_user(
    current_user=Depends(get_current_user),
):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
    }


@router.get("/admin")
async def admin_area(
    current_user=Depends(
        require_role("admin")
    ),
):
    return {
        "message": "Admin access granted",
        "user": current_user.email,
        "role": current_user.role.name,
    }


@router.get(
    "",
    response_model=list[UserResponse],
)
async def list_users(
    page: int = Query(
        1,
        ge=1,
    ),
    limit: int = Query(
        20,
        ge=1,
        le=100,
    ),
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role("admin")
    ),
):
    skip = (page - 1) * limit

    return get_users(
        db,
        skip=skip,
        limit=limit,
    )

@router.get(
    "/{user_id}",
    response_model=UserResponse,
)
async def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role("admin")
    ),
):
    user = get_user_by_id(
        db,
        user_id,
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return user


@router.post(
    "",
    response_model=UserResponse,
)
async def create_new_user(
    payload: UserCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role("admin")
    ),
):
    return create_user(
        db=db,
        name=payload.name,
        email=payload.email,
        password=payload.password,
        role_id=payload.role_id,
    )


@router.put(
    "/{user_id}",
    response_model=UserResponse,
)
async def update_existing_user(
    user_id: int,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role("admin")
    ),
):
    user = get_user_by_id(
        db,
        user_id,
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return update_user(
        db,
        user,
        **payload.model_dump()
    )


@router.delete(
    "/{user_id}"
)
async def remove_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role("admin")
    ),
):
    user = get_user_by_id(
        db,
        user_id,
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    delete_user(
        db,
        user,
    )

    return {
        "message": "User deleted successfully"
    }