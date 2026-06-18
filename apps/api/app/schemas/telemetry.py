from pydantic import BaseModel


class TelemetryBase(BaseModel):
    event_type: str
    source: str
    severity: str


class TelemetryCreate(TelemetryBase):
    pass


class TelemetryUpdate(BaseModel):
    event_type: str | None = None
    source: str | None = None
    severity: str | None = None


class TelemetryResponse(TelemetryBase):
    id: int

    class Config:
        from_attributes = True