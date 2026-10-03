"""Get court endpoints."""
from fastapi import HTTPException
from services.court_service import CourtService
from . import court_router

court_service = CourtService()


@court_router.get("/court")
def get_all_courts():
    """
    Retrieve all courts.

    Returns:
    - 200: List of all courts
    - 500: Internal server error
    """
    try:
        courts = court_service.get_all_courts()

        return {
            "status": "success",
            "count": len(courts),
            "courts": courts
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving courts: {str(e)}"
        )


@court_router.get("/court/{court_id}")
def get_court(court_id: str):
    """
    Retrieve a specific court by ID.

    Path Parameters:
    - court_id: The court ID

    Returns:
    - 200: Court details
    - 404: Court not found
    - 500: Internal server error
    """
    try:
        court = court_service.get_court(court_id)

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
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving court: {str(e)}"
        )
