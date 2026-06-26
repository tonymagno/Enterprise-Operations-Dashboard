from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import app.models

from app.routers import users
from app.routers import roles
from app.routers import alerts
from app.routers import telemetry
from app.routers import auth
from app.routers import dashboard

from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.exceptions import (
    http_exception_handler,
    validation_exception_handler,
)

app = FastAPI(
    title="Enterprise Operations Dashboard API",
    version="1.0.0"
)

# =========================
# CORS
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://192.168.1.6:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# Exception Handlers
# =========================

app.add_exception_handler(
    StarletteHTTPException,
    http_exception_handler,
)

app.add_exception_handler(
    RequestValidationError,
    validation_exception_handler,
)

# =========================
# Routers
# =========================

app.include_router(users.router)
app.include_router(roles.router)
app.include_router(alerts.router)
app.include_router(telemetry.router)
app.include_router(auth.router)
app.include_router(dashboard.router)

# =========================
# Health Checks
# =========================

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