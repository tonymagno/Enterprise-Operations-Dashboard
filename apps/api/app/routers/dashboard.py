from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies.auth import require_role
from app.crud.user import get_users
from app.crud.role import get_roles
from app.crud.alert import get_alerts
from app.crud.telemetry import get_telemetry_events
from app.schemas.dashboard import (
    DashboardMetricsResponse,
    DashboardOverviewResponse,
    SystemSummaryResponse,
)

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


@router.get(
    "/metrics",
    response_model=DashboardMetricsResponse,
)
def dashboard_metrics(
    db: Session = Depends(get_db),
):
    users = get_users(db)
    roles = get_roles(db)
    alerts = get_alerts(db)
    telemetry_events = get_telemetry_events(db)

    total_users = len(users)
    active_users = sum(1 for user in users if user.is_active)
    total_roles = len(roles)
    total_alerts = len(alerts)
    critical_alerts = sum(1 for alert in alerts if alert.severity == "critical")
    total_events = len(telemetry_events)
    critical_events = sum(1 for event in telemetry_events if event.severity == "critical")

    return {
        "total_users": total_users,
        "active_users": active_users,
        "total_roles": total_roles,
        "total_alerts": total_alerts,
        "critical_alerts": critical_alerts,
        "total_telemetry_events": total_events,
        "critical_telemetry_events": critical_events,
    }
@router.get(
    "/overview",
    response_model=DashboardOverviewResponse,
)
def dashboard_overview(
    db: Session = Depends(get_db),
):
    users = get_users(db)
    roles = get_roles(db)
    alerts = get_alerts(db)
    telemetry_events = get_telemetry_events(db)

    return {
        "users": {
            "total": len(users),
            "active": sum(
                1 for user in users
                if user.is_active
            ),
        },
        "roles": {
            "total": len(roles),
        },
        "alerts": {
            "total": len(alerts),
            "critical": sum(
                1 for alert in alerts
                if alert.severity == "critical"
            ),
        },
        "telemetry": {
            "total": len(telemetry_events),
            "critical": sum(
                1 for event in telemetry_events
                if event.severity == "critical"
            ),
        },
        "system_status": "healthy",
    }

@router.get("/alerts-by-severity")
def alerts_by_severity(
    db: Session = Depends(get_db),
    current_user=Depends(require_role("admin")),
):
    alerts = get_alerts(db)

    result = {
        "critical": 0,
        "high": 0,
        "medium": 0,
        "low": 0,
    }

    for alert in alerts:
        severity = alert.severity.lower()

        if severity in result:
            result[severity] += 1

    return result
@router.get("/telemetry-by-severity")
def telemetry_by_severity(
    db: Session = Depends(get_db),
    current_user=Depends(require_role("admin")),
):
    telemetry_events = get_telemetry_events(db)

    result = {
        "critical": 0,
        "high": 0,
        "medium": 0,
        "low": 0,
    }

    for event in telemetry_events:
        severity = event.severity.lower()

        if severity in result:
            result[severity] += 1

    return result
@router.get(
    "/system-summary",
    response_model=SystemSummaryResponse,
)
def system_summary(
    db: Session = Depends(get_db),
):
    users = get_users(db)
    alerts = get_alerts(db)
    telemetry_events = get_telemetry_events(db)

    critical_alerts = sum(
        1 for alert in alerts
        if alert.severity.lower() == "critical"
    )

    critical_events = sum(
        1 for event in telemetry_events
        if event.severity.lower() == "critical"
    )

    if critical_alerts > 0 or critical_events > 0:
        system_health = "warning"
    else:
        system_health = "healthy"

    return {
        "system_health": system_health,
        "users": len(users),
        "alerts": len(alerts),
        "critical_alerts": critical_alerts,
        "telemetry_events": len(telemetry_events),
        "critical_events": critical_events,
    }