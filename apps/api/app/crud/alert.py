from sqlalchemy.orm import Session

from app.models.alert import Alert
from app.schemas.alert import (
    AlertCreate,
    AlertUpdate,
)


def get_alerts(
    db: Session,
    skip: int = 0,
    limit: int = 20,
):
    return (
        db.query(Alert)
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_alert(db: Session, alert_id: int):
    return (
        db.query(Alert)
        .filter(Alert.id == alert_id)
        .first()
    )


def create_alert(
    db: Session,
    alert: AlertCreate
):
    db_alert = Alert(
        title=alert.title,
        severity=alert.severity,
        status=alert.status,
    )

    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)

    return db_alert


def update_alert(
    db: Session,
    alert_id: int,
    alert_data: AlertUpdate,
):
    alert = get_alert(
        db,
        alert_id,
    )

    if not alert:
        return None

    update_data = alert_data.model_dump(
        exclude_unset=True
    )

    for key, value in update_data.items():
        setattr(alert, key, value)

    db.commit()
    db.refresh(alert)

    return alert


def delete_alert(
    db: Session,
    alert_id: int,
):
    alert = get_alert(
        db,
        alert_id,
    )

    if not alert:
        return False

    db.delete(alert)
    db.commit()

    return True