"""
PayMongo webhook event handler endpoint.
Receives and processes payment status updates from PayMongo.
"""
from fastapi import APIRouter, HTTPException, Request
from config import get_settings
from api.utils.payment import (
    verify_paymongo_signature,
    handle_payment_succeeded,
    handle_payment_failed,
    handle_payment_processing,
)

settings = get_settings()

router = APIRouter()


@router.post("/webhook/paymongo")
async def webhook_paymongo(request: Request):
    """
    Handle PayMongo webhook events.
    Supported events:
    - payment.succeeded: Update transaction to paid
    - payment.failed: Update transaction to failed
    - payment_intent.processing: Payment processing
    """
    try:
        # Get raw body for signature verification
        body = await request.body()

        # Get signature from headers
        signature = request.headers.get("X-Paymongo-Signature")

        # Skip signature verification in development
        if settings.ENVIRONMENT != "development":
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
        payment_metadata = event_attributes.get("metadata", {})

        # Extract booking info from metadata
        booking_id = payment_metadata.get("booking_id")
        customer_email = payment_metadata.get("email")
        payment_amount = event_attributes.get("amount")

        # Route to appropriate handler
        if event_type == "payment.succeeded":
            return handle_payment_succeeded(
                payment_id=payment_id,
                booking_id=booking_id,
                amount=payment_amount,
                email=customer_email
            )

        elif event_type == "payment.failed":
            return handle_payment_failed(
                payment_id=payment_id,
                booking_id=booking_id,
                email=customer_email
            )

        elif event_type == "payment_intent.processing":
            return handle_payment_processing(
                payment_id=payment_id,
                booking_id=booking_id
            )

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
