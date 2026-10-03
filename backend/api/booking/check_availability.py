from fastapi import APIRouter, HTTPException, Query
from datetime import datetime
from services.booking_service import BookingService
from services.court_service import CourtService

router = APIRouter()
booking_service = BookingService()
court_service = CourtService()

@router.get("/court-availability")
def get_availability(
    start_date: str = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: str = Query(..., description="End date (YYYY-MM-DD)")
):
    """
    Retrieve court availability for a date range.
    Returns all bookings (unavailable time slots) for each court.

    Query Parameters:
    - start_date: Start date in YYYY-MM-DD format
    - end_date: End date in YYYY-MM-DD format

    Response:
    - date_range: The requested date range
    - courts: List of courts with their bookings for the date range
    """
    try:
        # Validate date format
        try:
            start = datetime.fromisoformat(start_date).date()
            end = datetime.fromisoformat(end_date).date()
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Invalid date format. Use YYYY-MM-DD"
            )

        if start > end:
            raise HTTPException(
                status_code=400,
                detail="start_date must be before end_date"
            )

        # Convert dates to ISO format with time boundaries for comparison
        start_datetime = datetime.fromisoformat(f"{start_date}T00:00:00").isoformat()
        end_datetime = datetime.fromisoformat(f"{end_date}T23:59:59").isoformat()

        # Fetch bookings for all courts in the date range
        try:
            courts = court_service.get_all_courts()
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error retrieving courts: {str(e)}"
            )

        courts_data = []
        for court in courts:
            court_id = court["court_id"]

            # Query booking items for this court within date range
            response = booking_service.booking_item_table.scan(
                FilterExpression="court_id = :cid AND start_time BETWEEN :start AND :end",
                ExpressionAttributeValues={
                    ":cid": court_id,
                    ":start": start_datetime,
                    ":end": end_datetime
                }
            )

            # Extract bookings and format them
            bookings = []
            for item in response.get("Items", []):
                bookings.append({
                    "booking_id": item.get("id"),
                    "start_time": item.get("start_time"),
                    "end_time": item.get("end_time")
                })

            # Sort bookings by start_time
            bookings.sort(key=lambda x: x["start_time"])

            courts_data.append({
                "court_id": court_id,
                "court_name": court["court_name"],
                "bookings": bookings
            })

        return {
            "date_range": {
                "start_date": start_date,
                "end_date": end_date
            },
            "courts": courts_data
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving availability: {str(e)}"
        )
