from fastapi import APIRouter, HTTPException
from datetime import datetime
import json
import os

router = APIRouter()

# Load dummy availability data
DUMMY_DATA_PATH = os.path.join(os.path.dirname(__file__), "../data/availability_dummy.json")

def load_availability_data():
    """Load availability dummy data from JSON file"""
    try:
        with open(DUMMY_DATA_PATH, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        raise HTTPException(
            status_code=500,
            detail="Availability data not found"
        )

@router.get("/availability")
def get_availability():
    """
    Retrieve court availability from today onwards.
    Returns all time slots across all courts with their availability status.
    Past bookings are excluded from the response.
    """
    try:
        data = load_availability_data()
        today = datetime.now().date()

        # Filter availability to only include today and future dates
        filtered_availability = [
            slot for slot in data["availability"]
            if datetime.fromisoformat(slot["date"]).date() >= today
        ]

        if not filtered_availability:
            # If no future availability data exists, return empty response
            return {
                "date_range": {
                    "start_date": None,
                    "end_date": None
                },
                "courts": data["courts"],
                "availability": []
            }

        # Determine date range from filtered availability data
        dates = [datetime.fromisoformat(slot["date"]).date() for slot in filtered_availability]
        start_date = min(dates)
        end_date = max(dates)

        return {
            "date_range": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat()
            },
            "courts": data["courts"],
            "availability": filtered_availability
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving availability: {str(e)}"
        )
