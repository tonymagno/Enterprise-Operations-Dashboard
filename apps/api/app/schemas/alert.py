from pydantic import BaseModel


class AlertBase(BaseModel):
    title: str
    severity: str
    status: str


class AlertCreate(AlertBase):
    pass


class AlertUpdate(BaseModel):
    title: str | None = None
    severity: str | None = None
    status: str | None = None


class AlertResponse(AlertBase):
    id: int

    class Config:
        from_attributes = True