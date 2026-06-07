from fastapi import FastAPI

app = FastAPI(
    title="Enterprise Operations Dashboard API",
    version="1.0.0"
)


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