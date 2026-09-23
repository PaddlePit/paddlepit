from fastapi import APIRouter, HTTPException
from uuid import UUID
from datetime import datetime
from schema.booking import BookingResponse, AllBookingsResponse
from api.utils import (
    validate_transaction_id,
    format_booking,
    sanitize_string,
)

router = APIRouter()

# Dummy data for testing
DUMMY_BOOKINGS = {
    "551e58e8-8e9d-4f5d-8b5f-4e5c5e5c5e5c": {
        "booking_id": UUID("551e58e8-8e9d-4f5d-8b5f-4e5c5e5c5e5c"),
        "booker_name": "John Doe",
        "phone": "+63-9175551234",
        "email": "john.doe@email.com",
        "courts_reserved": 2,
        "total_price": 90.00,
        "created_at": datetime(2026, 9, 5, 15, 30, 0),
    },
    "651e58e8-8e9d-4f5d-8b5f-4e5c5e5c5e5c": {
        "booking_id": UUID("651e58e8-8e9d-4f5d-8b5f-4e5c5e5c5e5c"),
        "booker_name": "Jane Smith",
        "phone": "+63-9175555678",
        "email": "jane.smith@email.com",
        "courts_reserved": 1,
        "total_price": 45.00,
        "created_at": datetime(2026, 9, 4, 10, 15, 0),
    },
    "751e58e8-8e9d-4f5d-8b5f-4e5c5e5c5e5c": {
        "booking_id": UUID("751e58e8-8e9d-4f5d-8b5f-4e5c5e5c5e5c"),
        "booker_name": "Michael Johnson",
        "phone": "+63-9175559012",
        "email": "michael.j@email.com",
        "courts_reserved": 3,
        "total_price": 155.00,
        "created_at": datetime(2026, 9, 3, 18, 45, 0),
    },
}

DUMMY_BOOKING_DETAILS = {
    "551e58e8-8e9d-4f5d-8b5f-4e5c5e5c5e5c": {
        "public_transaction_id": "1001",
        "status": "confirmed",
        "email": "john.doe@email.com",
        "bookings": [
            {
                "court_name": "Court 1 - North Wing",
                "date": datetime(2026, 9, 5, 15, 30, 0),
                "start_time": datetime(2026, 9, 5, 15, 30, 0),
                "end_time": datetime(2026, 9, 5, 16, 30, 0),
            },
            {
                "court_name": "Court 2 - South Wing",
                "date": datetime(2026, 9, 5, 15, 30, 0),
                "start_time": datetime(2026, 9, 5, 15, 30, 0),
                "end_time": datetime(2026, 9, 5, 16, 30, 0),
            },
        ],
    },
    "651e58e8-8e9d-4f5d-8b5f-4e5c5e5c5e5c": {
        "public_transaction_id": "1002",
        "email": "john.doe@email.com",
        "status": "confirmed",
        "bookings": [
            {
                "court_name": "Court 3 - Central",
                "date": datetime(2026, 9, 4, 10, 15, 0),
                "start_time": datetime(2026, 9, 4, 10, 15, 0),
                "end_time": datetime(2026, 9, 4, 11, 15, 0),
            },
        ],
    },
    "751e58e8-8e9d-4f5d-8b5f-4e5c5e5c5e5c": {
        "public_transaction_id": "1003",
        "status": "confirmed",
        "email": "john.doe@email.com",
        "bookings": [
            {
                "court_name": "Court 1 - North Wing",
                "date": datetime(2026, 9, 3, 18, 45, 0),
                "start_time": datetime(2026, 9, 3, 18, 45, 0),
                "end_time": datetime(2026, 9, 3, 19, 45, 0),
            },
            {
                "court_name": "Court 2 - South Wing",
                "date": datetime(2026, 9, 3, 18, 45, 0),
                "start_time": datetime(2026, 9, 3, 18, 45, 0),
                "end_time": datetime(2026, 9, 3, 19, 45, 0),
            },
            {
                "court_name": "Court 2A - Tournament",
                "date": datetime(2026, 9, 4, 9, 0, 0),
                "start_time": datetime(2026, 9, 4, 9, 0, 0),
                "end_time": datetime(2026, 9, 4, 10, 0, 0),
            },
        ],
    },
}


@router.get("/booking", response_model=list[AllBookingsResponse])
def get_all_bookings():
    """Retrieve all bookings with basic information"""
    try:
        if not DUMMY_BOOKINGS:
            raise HTTPException(status_code=404, detail="No bookings found")

        bookings = list(DUMMY_BOOKINGS.values())

        for booking in bookings:
            if not booking.get("email"):
                raise ValueError("Booking missing required email field")

        return bookings

    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid booking data: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/booking/{transaction_id}", response_model=BookingResponse)
def get_specific_booking(transaction_id: str):
    """Retrieve a specific booking with formatted dates and times"""

    try:
        # Validate transaction ID (string with security checks)
        validate_transaction_id(transaction_id)

        # Find booking by public_transaction_id
        booking_detail = None

        for booking in DUMMY_BOOKING_DETAILS.values():
            if booking.get("public_transaction_id") == transaction_id:
                booking_detail = booking
                break

        if not booking_detail:
            raise HTTPException(status_code=404, detail="Booking not found")

        # Validate required fields
        required_fields = ["public_transaction_id", "status", "email", "bookings"]
        
        for field in required_fields:
            if field not in booking_detail:
                raise ValueError(f"Booking missing required field: {field}")

        # Validate and sanitize email
        email = sanitize_string(booking_detail["email"])

        # Validate bookings list
        if not isinstance(booking_detail["bookings"], list):
            raise ValueError("Bookings must be a list")

        if len(booking_detail["bookings"]) == 0:
            raise ValueError("Booking must have at least one time slot")

        # Format all bookings
        formatted_bookings = []
        for index, booking in enumerate(booking_detail["bookings"]):
            try:
                formatted_bookings.append(format_booking(booking))
            except ValueError as e:
                raise ValueError(f"Error in booking {index + 1}: {str(e)}")

        return {
            "public_transaction_id": booking_detail["public_transaction_id"],
            "email": email,
            "status": sanitize_string(booking_detail["status"]),
            "bookings": formatted_bookings,
        }

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid booking data: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")