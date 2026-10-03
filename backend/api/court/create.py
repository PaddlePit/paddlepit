"""Create court endpoint."""
from fastapi import HTTPException
from pydantic import BaseModel, field_validator
from services.court_service import CourtService
from . import court_router

court_service = CourtService()


class CreateCourtRequest(BaseModel):
    """Request to create a new court."""
    court_name: str
    hourly_rate: float
    status: str = "available"

    @field_validator("court_name")
    @classmethod
    def validate_court_name(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Court name cannot be empty")
        if len(v) < 2:
            raise ValueError("Court name must be at least 2 characters")
        if len(v) > 50:
            raise ValueError("Court name cannot exceed 50 characters")
        return v.strip()

    @field_validator("hourly_rate")
    @classmethod
    def validate_hourly_rate(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Hourly rate must be greater than 0")
        if v > 10000:
            raise ValueError("Hourly rate cannot exceed 10,000")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed_statuses = ["available", "unavailable"]
        if v not in allowed_statuses:
            raise ValueError(f"Status must be one of: {', '.join(allowed_statuses)}")
        return v


@court_router.post("/court")
def create_court(request: CreateCourtRequest):
    """
    Create a new court.

    Request body:
    - court_name: Name of the court (2-50 characters)
    - hourly_rate: Price per hour (> 0, max 10,000)
    - status: "available" or "unavailable" (default: "available")

    Returns:
    - 200: Court created successfully with court details
    - 400: Invalid input data
    - 500: Internal server error
    """
    try:
        court = court_service.create_court(
            court_name=request.court_name,
            hourly_rate=request.hourly_rate,
            status=request.status
        )

        return {
            "status": "success",
            "court": court
        }

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error creating court: {str(e)}"
        )
