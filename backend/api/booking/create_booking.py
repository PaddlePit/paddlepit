"""Create booking endpoint with payment processing."""
from fastapi import APIRouter, HTTPException
import uuid

from schema.booking import CreateBookingRequest
from api.utils.booking import (
    calculate_booking_duration_hours,
    calculate_booking_price,
    process_paymongo_payment,
    get_court_rate,
)
from services.booking_service import BookingService
from services.discount_service import DiscountService

router = APIRouter()
booking_service = BookingService()
discount_service = DiscountService()


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
        discount_id = None
        if request.promo_code:
            try:
                promo = discount_service.validate_promo_code(request.promo_code)
                discount_amount = promo["discount_value"]
                discount_id = promo["id"]
                total_price = max(0, total_price - discount_amount)
                # Increment usage count
                discount_service.increment_usage(discount_id)
            except ValueError as e:
                raise HTTPException(
                    status_code=400,
                    detail=str(e)
                )

        # Generate IDs
        public_transaction_id = f"PDLPT{uuid.uuid4().hex[:8].upper()}"

        # Create booking in database (service generates booking_id)
        booking = booking_service.create_booking(
            booker_name=request.booker_name,
            phone=request.phone,
            email=request.email,
            courts_reserved=[item.court_id for item in request.booking_items],
            total_price=total_price
        )
        booking_id = booking["id"]

        # Create booking items in database
        booking_items_response = []
        for item in request.booking_items:
            item_price = get_court_rate(item.court_id) * calculate_booking_duration_hours(item.start_time, item.end_time)
            booking_item = booking_service.create_booking_item(
                booking_id=booking_id,
                court_id=item.court_id,
                start_time=item.start_time.isoformat(),
                end_time=item.end_time.isoformat(),
                price=item_price
            )
            booking_items_response.append({
                "court_id": item.court_id,
                "start_time": item.start_time.isoformat(),
                "end_time": item.end_time.isoformat(),
                "price": item_price
            })

        # Create transaction record
        transaction = booking_service.create_transaction(
            booking_id=booking_id,
            public_transaction_id=public_transaction_id,
            amount=total_price,
            payment_mode="card",
            discount_id=discount_id
        )

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
            "booking_items": booking_items_response,
            "payment_intent_status": payment_result.get("status"),
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
