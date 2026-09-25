from fastapi import APIRouter, HTTPException
from schema.booking import BookingResponse, AllBookingsResponse
from api.utils import (
    validate_transaction_id,
    format_booking,
    sanitize_string,
)
from services.booking_service import BookingService

router = APIRouter()
booking_service = BookingService()


@router.get("/booking", response_model=list[AllBookingsResponse])
def get_all_bookings():
    """Retrieve all bookings with basic information"""
    try:
        bookings = booking_service.get_all_bookings()

        if not bookings:
            raise HTTPException(status_code=404, detail="No bookings found")

        for booking in bookings:
            if not booking.get("email"):
                raise ValueError("Booking missing required email field")

        return bookings

    except HTTPException:
        raise
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

        # Get transaction by public_transaction_id
        transaction = booking_service.get_transaction_by_public_id(transaction_id)

        if not transaction:
            raise HTTPException(status_code=404, detail="Booking not found")

        # Get booking details
        booking = booking_service.get_booking(transaction["booking_id"])

        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")

        # Validate and sanitize email
        email = sanitize_string(booking["email"])

        # Format booking details
        booking_items = []
        if booking.get("courts_reserved"):
            for court_id in booking["courts_reserved"]:
                booking_items.append({
                    "court_name": f"Court {court_id}",
                    "start_time": booking.get("created_at"),
                    "end_time": booking.get("created_at"),
                })

        if len(booking_items) == 0:
            raise ValueError("Booking must have at least one time slot")

        # Format all bookings
        formatted_bookings = []
        for index, item in enumerate(booking_items):
            try:
                formatted_bookings.append(format_booking(item))
            except ValueError as e:
                raise ValueError(f"Error in booking {index + 1}: {str(e)}")

        return {
            "public_transaction_id": transaction.get("public_transaction_id"),
            "email": email,
            "status": transaction.get("status", "pending"),
            "bookings": formatted_bookings,
        }

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid booking data: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")