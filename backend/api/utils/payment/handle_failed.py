"""Handle failed payment events."""
from fastapi import HTTPException
from api.utils.payment.store import set_transaction


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
        # TODO: Update TransactionDetail in database with status 'failed'
        # transaction = db.query(TransactionDetail).filter(
        #     TransactionDetail.paymongo_transaction_id == payment_id
        # ).first()
        # if transaction:
        #     transaction.status = "failed"
        #     db.commit()

        # For now: Store in-memory
        set_transaction(booking_id, {
            "status": "failed",
            "paymongo_id": payment_id,
            "email": email
        })

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
