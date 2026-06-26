from sqlalchemy import Integer, String

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship
)

from app.db.base import Base


class Role(Base):
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )

    name: Mapped[str] = mapped_column(
        String(100),
        unique=True
    )

    description: Mapped[str] = mapped_column(
        String(255)
    )

    users = relationship(
        "User",
        back_populates="role"
    )