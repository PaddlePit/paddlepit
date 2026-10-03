"""Update court endpoint."""
from fastapi import HTTPException
from pydantic import BaseModel, field_validator
from services.court_service import CourtService
from . import court_router

court_service = CourtService()


class UpdateCourtRequest(BaseModel):
    """Request to update court details."""
    court_name: str | None = None
    hourly_rate: float | None = None
    status: str | None = None

    @field_validator("court_name")
    @classmethod
    def validate_court_name(cls, v: str | None) -> str | None:
        if v is None:
            return v
        if not v or not v.strip():
            raise ValueError("Court name cannot be empty")
        if len(v) < 2:
            raise ValueError("Court name must be at least 2 characters")
        if len(v) > 50:
            raise ValueError("Court name cannot exceed 50 characters")
        return v.strip()

    @field_validator("hourly_rate")
    @classmethod
    def validate_hourly_rate(cls, v: float | None) -> float | None:
        if v is None:
            return v
        if v <= 0:
            raise ValueError("Hourly rate must be greater than 0")
        if v > 10000:
            raise ValueError("Hourly rate cannot exceed 10,000")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str | None) -> str | None:
        if v is None:
            return v
        allowed_statuses = ["available", "unavailable"]
        if v not in allowed_statuses:
            raise ValueError(f"Status must be one of: {', '.join(allowed_statuses)}")
        return v


@court_router.put("/court/{court_id}")
def update_court(court_id: str, request: UpdateCourtRequest):
    """
    Update court details.

    Path Parameters:
    - court_id: The court ID

    Request body (all fields optional):
    - court_name: New court name (2-50 characters)
    - hourly_rate: New hourly rate (> 0, max 10,000)
    - status: New status ("available" or "unavailable")

    Returns:
    - 200: Court updated successfully
    - 400: Invalid input data
    - 404: Court not found
    - 500: Internal server error
    """
    try:
        # Prepare update data (only include fields that are not None)
        update_data = {}
        if request.court_name is not None:
            update_data["court_name"] = request.court_name
        if request.hourly_rate is not None:
            update_data["hourly_rate"] = request.hourly_rate
        if request.status is not None:
            update_data["status"] = request.status

        if not update_data:
            raise HTTPException(
                status_code=400,
                detail="At least one field must be provided for update"
            )

        # Update the court
        court = court_service.update_court(court_id, update_data)

        if not court:
            raise HTTPException(
                status_code=404,
                detail=f"Court '{court_id}' not found"
            )

        return {
            "status": "success",
            "court": court
        }

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error updating court: {str(e)}"
        )
