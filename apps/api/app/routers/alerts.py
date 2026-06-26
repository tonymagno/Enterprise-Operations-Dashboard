from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
)
from sqlalchemy.orm import Session

from app.db.session import get_db

from app.crud.alert import (
    get_alerts,
    get_alert,
    create_alert,
    update_alert,
    delete_alert,
)

from app.schemas.alert import (
    AlertCreate,
    AlertUpdate,
    AlertResponse,
)

router = APIRouter(
    prefix="/alerts",
    tags=["Alerts"],
)


@router.get("/", response_model=list[AlertResponse])
def list_alerts(
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
):
    skip = (page - 1) * limit

    return get_alerts(
        db,
        skip=skip,
        limit=limit,
    )


@router.get("/{alert_id}", response_model=AlertResponse)
def get_alert_by_id(
    alert_id: int,
    db: Session = Depends(get_db)
):
    alert = get_alert(
        db,
        alert_id,
    )

    if not alert:
        raise HTTPException(
            status_code=404,
            detail="Alert not found"
        )

    return alert


@router.post("/", response_model=AlertResponse)
def create_new_alert(
    alert: AlertCreate,
    db: Session = Depends(get_db)
):
    return create_alert(
        db,
        alert,
    )


@router.put("/{alert_id}", response_model=AlertResponse)
def update_existing_alert(
    alert_id: int,
    alert: AlertUpdate,
    db: Session = Depends(get_db)
):
    updated_alert = update_alert(
        db,
        alert_id,
        alert,
    )

    if not updated_alert:
        raise HTTPException(
            status_code=404,
            detail="Alert not found"
        )

    return updated_alert


@router.delete("/{alert_id}")
def remove_alert(
    alert_id: int,
    db: Session = Depends(get_db)
):
    deleted = delete_alert(
        db,
        alert_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Alert not found"
        )

    return {
        "message": "Alert deleted successfully"
    }