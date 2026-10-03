import logging
import uuid
from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pythonjsonlogger import jsonlogger

from api.booking.check_availability import router as availability_router
from api import promo_router, webhook_router, booking_router, court_router

# Set up JSON logger
logger = logging.getLogger("paddlepit.api")
logger.setLevel(logging.WARNING)

# Create console handler with JSON formatter
console_handler = logging.StreamHandler()
json_formatter = jsonlogger.JsonFormatter()
console_handler.setFormatter(json_formatter)
logger.addHandler(console_handler)

app = FastAPI(
    title="PaddlePit API",
    version="0.1.0",
)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    request_id = str(uuid.uuid4())

    # Format errors for logging
    errors = [
        {
            "field": error["loc"][-1],
            "type": error["type"],
            "message": error["msg"]
        }
        for error in exc.errors()
    ]

    # Log detailed validation errors server-side
    logger.warning(
        f"Validation error [{request_id}]: {request.method} {request.url.path}",
        extra={
            "request_id": request_id,
            "method": request.method,
            "path": request.url.path,
            "errors": errors
        }
    )

    # Return generic response to client (no sensitive details)
    return JSONResponse(
        status_code=422,
        content={
            "error": "Request failed",
            "request_id": request_id
        }
    )

@app.get("/health")
def health_check():
    return {"status": "ok"}


app.include_router(availability_router)
app.include_router(booking_router)
app.include_router(court_router)
app.include_router(promo_router)
app.include_router(webhook_router) 