"""
Payment status checking endpoint.
Allows frontend to query payment status for a booking.
"""
from fastapi import APIRouter
from api.utils.payment import get_payment_status

router = APIRouter()


@router.get("/payment/status/{booking_id}")
def get_booking_payment_status(booking_id: str) -> dict:
    """
    Get payment status for a specific booking.
    Useful for frontend to check if payment completed without waiting for webhook.

    Args:
        booking_id: The booking ID to check status for

    Returns:
        Payment status with booking_id, status, payment_id, and amount
    """
    return get_payment_status(booking_id)
