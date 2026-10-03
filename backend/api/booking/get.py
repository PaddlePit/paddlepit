from fastapi import HTTPException
from schema.booking import BookingResponse, AllBookingsResponse
from api.utils import (
    validate_transaction_id,
    format_booking,
    sanitize_string,
)
from services.booking_service import BookingService
from datetime import datetime
from . import booking_router

booking_service = BookingService()

@booking_router.get("/booking", response_model=list[AllBookingsResponse])
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

@booking_router.get("/booking/{public_transaction_id}", response_model=BookingResponse)
def get_specific_booking(public_transaction_id: str):
    """Retrieve a specific booking with formatted dates and times"""

    try:
        # Validate transaction ID (string with security checks)
        validate_transaction_id(public_transaction_id)

        # Get transaction by public_transaction_id
        transaction = booking_service.get_transaction_by_public_id(public_transaction_id)

        if not transaction:
            raise HTTPException(status_code=404, detail="Booking not found")

        # Get booking details
        booking = booking_service.get_booking(transaction["booking_id"])

        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")

        # Validate and sanitize email
        email = sanitize_string(booking["email"])

        # Get booking items (actual time slots) for this booking
        booking_response = booking_service.booking_item_table.scan(
            FilterExpression="booking_id = :bid",
            ExpressionAttributeValues={":bid": booking["id"]}
        )

        booking_items = booking_response.get("Items", [])
        if not booking_items:
            raise ValueError("Booking must have at least one time slot")

        # Format booking items with actual start/end times
        formatted_bookings = []
        for index, item in enumerate(booking_items):
            try:
                start_time = item.get("start_time")
                end_time = item.get("end_time")

                # Parse datetime strings if they're strings
                if isinstance(start_time, str):
                    start_time = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
                if isinstance(end_time, str):
                    end_time = datetime.fromisoformat(end_time.replace('Z', '+00:00'))

                formatted_item = {
                    "court_name": item.get('court_id'),
                    "date": start_time,
                    "start_time": start_time,
                    "end_time": end_time,
                }
                formatted_bookings.append(format_booking(formatted_item))
            except ValueError as e:
                raise ValueError(f"Error in booking {index + 1}: {str(e)}")

        return {
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