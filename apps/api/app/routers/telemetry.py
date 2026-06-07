from fastapi import APIRouter

router = APIRouter(prefix="/telemetry", tags=["Telemetry"])


@router.get("/")
async def list_events():
    return {
        "message": "Telemetry events"
    }