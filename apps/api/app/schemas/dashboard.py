from pydantic import BaseModel


class DashboardMetricsResponse(BaseModel):
    total_users: int
    active_users: int
    total_roles: int
    total_alerts: int
    critical_alerts: int
    total_telemetry_events: int
    critical_telemetry_events: int


class UsersSummary(BaseModel):
    total: int
    active: int


class RolesSummary(BaseModel):
    total: int


class AlertsSummary(BaseModel):
    total: int
    critical: int


class TelemetrySummary(BaseModel):
    total: int
    critical: int


class DashboardOverviewResponse(BaseModel):
    users: UsersSummary
    roles: RolesSummary
    alerts: AlertsSummary
    telemetry: TelemetrySummary
    system_status: str


class SystemSummaryResponse(BaseModel):
    system_health: str
    users: int
    alerts: int
    critical_alerts: int
    telemetry_events: int
    critical_events: int