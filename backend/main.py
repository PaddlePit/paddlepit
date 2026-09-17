from fastapi import FastAPI

from api.check_availability import router as availability_router
from api.booking.create_booking import router as create_booking_router
from backend.api.booking.promo import router as promo_router
from api.payment.webhook import router as webhook_router
from api.payment.status import router as payment_status_router

app = FastAPI(
    title="PaddlePit API",
    version="0.1.0",
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Root API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}


app.include_router(availability_router)
app.include_router(create_booking_router)
app.include_router(promo_router)
app.include_router(webhook_router)
app.include_router(payment_status_router) 