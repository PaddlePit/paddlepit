"""Handle successful payment events."""
from fastapi import HTTPException
from services.booking_service import BookingService


def handle_payment_succeeded(
    payment_id: str,
    booking_id: str,
    amount: int,
    email: str
) -> dict:
    """
    Handle successful payment event from PayMongo.

    Updates transaction status to 'paid' and logs the successful payment.

    Args:
        payment_id: PayMongo payment ID
        booking_id: Booking identifier
        amount: Payment amount in centavos
        email: Customer email address

    Returns:
        Response dict with success status and transaction details
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
                    ":status": "paid",
                    ":payment_id": payment_id
                }
            )

        print(f"Payment succeeded for booking {booking_id}")
        print(f"Amount: ₱{amount / 100:.2f}")

        # TODO: Send confirmation email
        # send_booking_confirmation_email(email, booking_id)

        return {
            "status": "success",
            "message": "Payment recorded successfully",
            "booking_id": booking_id,
            "payment_id": payment_id,
            "transaction_status": "paid"
        }

    except Exception as e:
        print(f"Error handling payment success: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to record payment: {str(e)}"
        )
