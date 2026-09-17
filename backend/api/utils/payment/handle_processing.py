"""Handle payment processing events."""
from api.utils.payment.store import set_transaction


def handle_payment_processing(
    payment_id: str,
    booking_id: str
) -> dict:
    """
    Handle payment still processing event from PayMongo.

    Tracks when payment is awaiting customer action (3D Secure verification, etc).

    Args:
        payment_id: PayMongo payment ID
        booking_id: Booking identifier

    Returns:
        Response dict acknowledging the processing status
    """
    print(f"Payment processing for booking {booking_id}")

    set_transaction(booking_id, {
        "status": "processing",
        "paymongo_id": payment_id
    })

    return {
        "status": "acknowledged",
        "message": "Payment is processing",
        "booking_id": booking_id,
        "payment_id": payment_id
    }
