from fastapi import FastAPI

from api.utils.validation.check_availability import router as availability_router
from api import promo_router, webhook_router, booking_router


app = FastAPI(
    title="PaddlePit API",
    version="0.1.0",
)

@app.get("/health")
def health_check():
    return {"status": "ok"}


app.include_router(availability_router)
app.include_router(booking_router)
app.include_router(promo_router)
app.include_router(webhook_router) 