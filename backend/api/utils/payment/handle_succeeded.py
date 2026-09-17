"""Handle successful payment events."""
from fastapi import HTTPException
from api.utils.payment.store import set_transaction


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
        # TODO: Update TransactionDetail in database with status 'paid'
        # transaction = db.query(TransactionDetail).filter(
        #     TransactionDetail.paymongo_transaction_id == payment_id
        # ).first()
        # if transaction:
        #     transaction.status = "paid"
        #     db.commit()

        # For now: Store in-memory
        set_transaction(booking_id, {
            "status": "paid",
            "paymongo_id": payment_id,
            "amount": amount,
            "email": email
        })

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
