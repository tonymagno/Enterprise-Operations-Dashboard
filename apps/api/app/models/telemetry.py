from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class TelemetryEvent(Base):
    __tablename__ = "telemetry_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    event_type: Mapped[str] = mapped_column(String(100))

    source: Mapped[str] = mapped_column(String(255))

    severity: Mapped[str] = mapped_column(String(50))