"""Handle failed payment events."""
from fastapi import HTTPException
from services.booking_service import BookingService


def handle_payment_failed(
    payment_id: str,
    booking_id: str,
    email: str
) -> dict:
    """
    Handle failed payment event from PayMongo.

    Updates transaction status to 'failed' and notifies customer to retry.

    Args:
        payment_id: PayMongo payment ID
        booking_id: Booking identifier
        email: Customer email address

    Returns:
        Response dict with recorded status
    """
    try:
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
                    ":status": "failed",
                    ":payment_id": payment_id
                }
            )

        print(f"Payment failed for booking {booking_id}")

        # TODO: Send failure notification email
        # send_payment_failed_email(email, booking_id)

        return {
            "status": "recorded",
            "message": "Payment failure recorded",
            "booking_id": booking_id,
            "payment_id": payment_id,
            "transaction_status": "failed"
        }

    except Exception as e:
        print(f"Error handling payment failure: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to record payment failure: {str(e)}"
        )
