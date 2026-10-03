"""Handle payment processing events."""
from services.booking_service import BookingService


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

    booking_service = BookingService()
    transaction_table = booking_service.transaction_table

    # Get transaction by booking_id, then update it
    transaction = booking_service.get_transaction_by_booking_id(booking_id)
    if transaction:
        transaction_table.update_item(
            Key={"id": transaction["id"]},
            UpdateExpression="SET #status = :status, paymongo_transaction_id = :payment_id",
            ExpressionAttributeNames={"#status": "status"},
            ExpressionAttributeValues={
                ":status": "processing",
                ":payment_id": payment_id
            }
        )

    return {
        "status": "acknowledged",
        "message": "Payment is processing",
        "booking_id": booking_id,
        "payment_id": payment_id
    }
