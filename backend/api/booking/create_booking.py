"""Create booking endpoint with payment processing."""
from fastapi import APIRouter, HTTPException
import uuid

from ...schema.booking import CreateBookingRequest
from api.utils.booking import (
    calculate_booking_duration_hours,
    calculate_booking_price,
    process_paymongo_payment,
    get_court_rate,
)

router = APIRouter()

# Dummy promo codes for discount validation
DUMMY_PROMO_CODES = {
    "PROMO20": {"discount_amount": 100, "is_active": True},
    "WELCOME100": {"discount_amount": 500, "is_active": True}
}


@router.post("/booking")
def create_booking(request: CreateBookingRequest):
    """
    Create a new booking and process payment through PayMongo.

    Process:
    1. Validate booking items (at least one required)
    2. Calculate total price based on court rates and duration
    3. Apply promo code discount if provided
    4. Create payment intent with PayMongo
    5. Return booking confirmation with payment details

    Args:
        request: Booking creation request with booker info and booking items

    Returns:
        Booking confirmation with payment intent details if successful
        Error response if any step fails
    """
    try:
        # Validate booking items
        if not request.booking_items:
            raise HTTPException(
                status_code=400,
                detail="At least one booking item is required"
            )

        # Calculate total price
        total_price = calculate_booking_price(request.booking_items)

        # Apply promo code discount if provided
        discount_amount = 0.0
        if request.promo_code:
            promo_code = request.promo_code.upper()
            if promo_code not in DUMMY_PROMO_CODES:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid promo code: {promo_code}"
                )

            promo = DUMMY_PROMO_CODES[promo_code]
            if not promo["is_active"]:
                raise HTTPException(
                    status_code=400,
                    detail="Promo code is no longer active"
                )

            discount_amount = promo["discount_amount"]
            total_price = max(0, total_price - discount_amount)

        # Generate IDs
        booking_id = str(uuid.uuid4())
        public_transaction_id = f"TXN{uuid.uuid4().hex[:8].upper()}"

        # Convert amount to centavos (multiply by 100)
        amount_centavos = int(total_price * 100)

        # Process payment through PayMongo
        payment_result = process_paymongo_payment(
            amount_centavos,
            booking_id,
            request.email
        )

        if not payment_result["success"]:
            return {
                "status": "failed",
                "message": "Payment processing failed",
                "error": payment_result.get("error"),
                "booking_id": booking_id,
                "transaction_id": public_transaction_id
            }

        # Payment intent created successfully
        return {
            "status": "success",
            "message": "Booking created. Payment intent ready.",
            "booking_id": booking_id,
            "transaction_id": public_transaction_id,
            "paymongo_transaction_id": payment_result.get("payment_intent_id"),
            "client_key": payment_result.get("client_key"),
            "booker_name": request.booker_name,
            "email": request.email,
            "total_price": total_price,
            "discount_amount": discount_amount,
            "booking_items": [
                {
                    "court_id": item.court_id,
                    "start_time": item.start_time.isoformat(),
                    "end_time": item.end_time.isoformat(),
                    "price": get_court_rate(item.court_id) * calculate_booking_duration_hours(item.start_time, item.end_time)
                }
                for item in request.booking_items
            ],
            "payment_intent_status": payment_result.get("status"),
            "payment_method_allowed": ["card", "gcash", "paymaya"]
        }

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid booking data: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error creating booking: {str(e)}"
        )
