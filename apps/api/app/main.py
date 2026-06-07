from fastapi import FastAPI

from app.routers import users
from app.routers import alerts
from app.routers import telemetry

app = FastAPI(
    title="Enterprise Operations Dashboard API",
    version="1.0.0"
)

app.include_router(users.router)
app.include_router(alerts.router)
app.include_router(telemetry.router)


@app.get("/")
async def root():
    return {
        "name": "Enterprise Operations Dashboard",
        "status": "online",
        "version": "1.0.0"
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy"
    }