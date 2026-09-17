"""Query payment status for bookings."""
from api.utils.payment.store import get_transaction


def get_payment_status(booking_id: str) -> dict:
    """
    Get payment status for a booking.

    Useful for frontend to check if payment completed without waiting for webhook.

    Args:
        booking_id: Booking identifier to check

    Returns:
        Dict with booking_id, status, payment_id, and amount (if found)
        Or not_found status if no transaction exists
    """
    transaction = get_transaction(booking_id)

    if not transaction:
        return {
            "booking_id": booking_id,
            "status": "not_found",
            "message": "No transaction found for this booking"
        }

    return {
        "booking_id": booking_id,
        "status": transaction.get("status"),
        "payment_id": transaction.get("paymongo_id"),
        "amount": transaction.get("amount")
    }
