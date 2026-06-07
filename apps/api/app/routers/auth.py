from fastapi import APIRouter

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/login")
async def login():
    return {
        "message": "JWT login endpoint"
    }


@router.post("/refresh")
async def refresh():
    return {
        "message": "Refresh token endpoint"
    }