from fastapi import APIRouter, HTTPException, Request
from typing import Optional
import hmac
import hashlib
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

PAYMONGO_SECRET_KEY = os.getenv("PAYMONGO_SECRET_KEY")
PAYMONGO_WEBHOOK_SECRET = os.getenv("PAYMONGO_WEBHOOK_SECRET", "")

# In-memory transaction store (replace with database in production)
TRANSACTIONS = {}

def verify_paymongo_signature(request_body: bytes, signature: str) -> bool:
    """
    Verify PayMongo webhook signature for security.
    PayMongo signs webhooks with HMAC-SHA256.
    """
    try:
        # Create HMAC signature
        expected_signature = hmac.new(
            key=PAYMONGO_SECRET_KEY.encode(),
            msg=request_body,
            digestmod=hashlib.sha256
        ).hexdigest()

        # Compare signatures (constant-time comparison to prevent timing attacks)
        return hmac.compare_digest(expected_signature, signature)
    except Exception as e:
        print(f"Signature verification error: {str(e)}")
        return False

@router.post("/webhook/paymongo")
async def handle_paymongo_webhook(request: Request):
    """
    Handle PayMongo webhook events.
    Supported events:
    - payment.succeeded: Update transaction to paid
    - payment.failed: Update transaction to failed
    """
    try:
        # Get raw body for signature verification
        body = await request.body()

        # Get signature from headers
        signature = request.headers.get("X-Paymongo-Signature")
        if not signature:
            raise HTTPException(
                status_code=400,
                detail="Missing X-Paymongo-Signature header"
            )

        # Verify webhook signature
        if not verify_paymongo_signature(body, signature):
            raise HTTPException(
                status_code=401,
                detail="Invalid webhook signature"
            )

        # Parse JSON payload
        payload = await request.json()

        # Extract event details
        event_type = payload.get("type")
        event_data = payload.get("data", {})
        event_attributes = event_data.get("attributes", {})

        # Get payment details
        payment_id = event_data.get("id")
        payment_status = event_attributes.get("status")
        payment_amount = event_attributes.get("amount")  # in centavos
        payment_metadata = event_attributes.get("metadata", {})

        # Extract booking info from metadata
        booking_id = payment_metadata.get("booking_id")
        customer_email = payment_metadata.get("email")

        print(f"Webhook received: {event_type} for booking {booking_id}")

        # Handle payment succeeded
        if event_type == "payment.succeeded":
            return handle_payment_succeeded(
                payment_id=payment_id,
                booking_id=booking_id,
                amount=payment_amount,
                email=customer_email
            )

        # Handle payment failed
        elif event_type == "payment.failed":
            return handle_payment_failed(
                payment_id=payment_id,
                booking_id=booking_id,
                email=customer_email
            )

        # Handle payment processing
        elif event_type == "payment_intent.processing":
            return handle_payment_processing(
                payment_id=payment_id,
                booking_id=booking_id
            )

        # Unknown event type
        else:
            print(f"Unknown event type: {event_type}")
            return {
                "status": "acknowledged",
                "message": f"Event type {event_type} not handled"
            }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Webhook error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Webhook processing error: {str(e)}"
        )

def handle_payment_succeeded(
    payment_id: str,
    booking_id: str,
    amount: int,
    email: str
) -> dict:
    """
    Handle successful payment.
    Update transaction status to 'paid'.
    """
    try:
        # In production: Update TransactionDetail in database
        # transaction = db.query(TransactionDetail).filter(
        #     TransactionDetail.paymongo_transaction_id == payment_id
        # ).first()
        # if transaction:
        #     transaction.status = "paid"
        #     db.commit()

        # For now: Log to in-memory store
        TRANSACTIONS[booking_id] = {
            "status": "paid",
            "paymongo_id": payment_id,
            "amount": amount,
            "email": email
        }

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

def handle_payment_failed(
    payment_id: str,
    booking_id: str,
    email: str
) -> dict:
    """
    Handle failed payment.
    Update transaction status to 'failed'.
    Notify customer to retry.
    """
    try:
        # In production: Update TransactionDetail in database
        # transaction = db.query(TransactionDetail).filter(
        #     TransactionDetail.paymongo_transaction_id == payment_id
        # ).first()
        # if transaction:
        #     transaction.status = "failed"
        #     db.commit()

        # For now: Log to in-memory store
        TRANSACTIONS[booking_id] = {
            "status": "failed",
            "paymongo_id": payment_id,
            "email": email
        }

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

def handle_payment_processing(
    payment_id: str,
    booking_id: str
) -> dict:
    """
    Handle payment still processing (e.g., awaiting customer action).
    """
    print(f"Payment processing for booking {booking_id}")

    TRANSACTIONS[booking_id] = {
        "status": "processing",
        "paymongo_id": payment_id
    }

    return {
        "status": "acknowledged",
        "message": "Payment is processing",
        "booking_id": booking_id,
        "payment_id": payment_id
    }

@router.get("/webhook/status/{booking_id}")
def get_payment_status(booking_id: str) -> dict:
    """
    Get payment status for a booking.
    Useful for frontend to check if payment completed.
    """
    if booking_id not in TRANSACTIONS:
        return {
            "booking_id": booking_id,
            "status": "not_found",
            "message": "No transaction found for this booking"
        }

    transaction = TRANSACTIONS[booking_id]
    return {
        "booking_id": booking_id,
        "status": transaction.get("status"),
        "payment_id": transaction.get("paymongo_id"),
        "amount": transaction.get("amount")
    }
