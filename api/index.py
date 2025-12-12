from fastapi import FastAPI
from routes.auth import router as auth_router
from routes.sites import router as sites_router

app = FastAPI()

app.include_router(auth_router)
app.include_router(sites_router)


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "evoloop"}
