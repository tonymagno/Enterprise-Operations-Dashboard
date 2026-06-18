from sqlalchemy.orm import Session

from app.models.telemetry import TelemetryEvent
from app.schemas.telemetry import (
    TelemetryCreate,
    TelemetryUpdate,
)


def get_telemetry_events(
    db: Session,
    skip: int = 0,
    limit: int = 20,
):
    return (
        db.query(TelemetryEvent)
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_telemetry_event(
    db: Session,
    event_id: int,
):
    return (
        db.query(TelemetryEvent)
        .filter(
            TelemetryEvent.id == event_id
        )
        .first()
    )


def create_telemetry_event(
    db: Session,
    event: TelemetryCreate,
):
    db_event = TelemetryEvent(
        event_type=event.event_type,
        source=event.source,
        severity=event.severity,
    )

    db.add(db_event)
    db.commit()
    db.refresh(db_event)

    return db_event


def update_telemetry_event(
    db: Session,
    event_id: int,
    event_data: TelemetryUpdate,
):
    event = get_telemetry_event(
        db,
        event_id,
    )

    if not event:
        return None

    update_data = event_data.model_dump(
        exclude_unset=True
    )

    for key, value in update_data.items():
        setattr(event, key, value)

    db.commit()
    db.refresh(event)

    return event


def delete_telemetry_event(
    db: Session,
    event_id: int,
):
    event = get_telemetry_event(
        db,
        event_id,
    )

    if not event:
        return False

    db.delete(event)
    db.commit()

    return True