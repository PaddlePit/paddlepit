from fastapi import FastAPI

from api.utils.validation.check_availability import router as availability_router
from api.booking import (
    create_booking_router,
    get_booking_router
)
from api.payment import (
    webhook_router,
    status_router,
)
from api.promo import (
    promo_routers)

app = FastAPI(
    title="PaddlePit API",
    version="0.1.0",
)

@app.get("/health")
def health_check():
    return {"status": "ok"}


app.include_router(availability_router)
app.include_router(create_booking_router)
app.include_router(get_booking_router)
for router in promo_routers:
    app.include_router(router)
app.include_router(webhook_router)
app.include_router(status_router) 

from db import initialize_db

# @app.get("/health/db")
# def db_health_check():
#     """Check if DynamoDB connection is working."""
#     try:
#         ddb = initialize_db()
#         ddb.meta.client.list_tables()
#         return {
#             "status": "healthy",
#             "database": "dynamodb",
#             "message": "Database connection successful"
#         }
#     except Exception as e:
#         return {
#             "status": "unhealthy",
#             "database": "dynamodb",
#             "error": str(e)
#         }, 500
