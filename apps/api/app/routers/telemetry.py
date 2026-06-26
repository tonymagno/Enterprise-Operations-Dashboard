from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
)
from sqlalchemy.orm import Session

from app.db.session import get_db

from app.schemas.telemetry import (
    TelemetryCreate,
    TelemetryUpdate,
    TelemetryResponse,
)

from app.crud.telemetry import (
    get_telemetry_events,
    get_telemetry_event,
    create_telemetry_event,
    update_telemetry_event,
    delete_telemetry_event,
)

router = APIRouter(
    prefix="/telemetry",
    tags=["Telemetry"],
)


@router.get(
    "/",
    response_model=list[TelemetryResponse],
)
def list_events(
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

    return get_telemetry_events(
        db,
        skip=skip,
        limit=limit,
    )


@router.get(
    "/{event_id}",
    response_model=TelemetryResponse,
)
def get_event(
    event_id: int,
    db: Session = Depends(get_db),
):
    event = get_telemetry_event(
        db,
        event_id,
    )

    if not event:
        raise HTTPException(
            status_code=404,
            detail="Telemetry event not found",
        )

    return event


@router.post(
    "/",
    response_model=TelemetryResponse,
)
def create_event(
    event: TelemetryCreate,
    db: Session = Depends(get_db),
):
    return create_telemetry_event(
        db,
        event,
    )


@router.put(
    "/{event_id}",
    response_model=TelemetryResponse,
)
def update_event(
    event_id: int,
    event_data: TelemetryUpdate,
    db: Session = Depends(get_db),
):
    event = update_telemetry_event(
        db,
        event_id,
        event_data,
    )

    if not event:
        raise HTTPException(
            status_code=404,
            detail="Telemetry event not found",
        )

    return event


@router.delete(
    "/{event_id}",
)
def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
):
    deleted = delete_telemetry_event(
        db,
        event_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Telemetry event not found",
        )

    return {
        "message": "Telemetry event deleted successfully"
    }