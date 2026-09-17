from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
import uuid
import requests
import base64
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# PayMongo configuration
PAYMONGO_SECRET_KEY = os.getenv("PAYMONGO_SECRET_KEY")
PAYMONGO_PUBLIC_KEY = os.getenv("PAYMONGO_PUBLIC_KEY")
PAYMONGO_API_URL = "https://api.paymongo.com/v1"

# Court rates (in pesos per hour)
COURT_RATES = {
    "court-1": 250,
    "court-2": 250,
    "court-3": 250
}

# Dummy promo codes for discount validation
DUMMY_PROMO_CODES = {
    "PROMO20": {"discount_amount": 100, "is_active": True},
    "WELCOME100": {"discount_amount": 500, "is_active": True}
}

class BookingItem(BaseModel):
    court_id: str
    start_time: datetime
    end_time: datetime

class CreateBookingRequest(BaseModel):
    booker_name: str
    email: EmailStr
    phone: str
    booking_items: list[BookingItem]
    promo_code: Optional[str] = None

def calculate_booking_duration_hours(start_time: datetime, end_time: datetime) -> float:
    """Calculate duration in hours"""
    delta = end_time - start_time
    return delta.total_seconds() / 3600

def calculate_booking_price(booking_items: list[BookingItem]) -> float:
    """Calculate total price for all booking items"""
    total = 0.0
    for item in booking_items:
        if item.court_id not in COURT_RATES:
            raise ValueError(f"Invalid court ID: {item.court_id}")

        duration_hours = calculate_booking_duration_hours(item.start_time, item.end_time)
        if duration_hours <= 0:
            raise ValueError("End time must be after start time")

        court_rate = COURT_RATES[item.court_id]
        total += court_rate * duration_hours

    return total

def process_paymongo_payment(amount_centavos: int, booking_id: str, email: str) -> dict:
    """
    Process payment through PayMongo Payments API
    Amount should be in centavos (e.g., 100 pesos = 10000 centavos)
    """
    try:
        # Prepare basic auth
        credentials = base64.b64encode(f"{PAYMONGO_SECRET_KEY}:".encode()).decode()

        headers = {
            "Authorization": f"Basic {credentials}",
            "Content-Type": "application/json"
        }

        # Create payment intent
        payment_data = {
            "data": {
                "attributes": {
                    "amount": amount_centavos,
                    "currency": "PHP",
                    "description": f"PaddlePit Booking {booking_id}",
                    "statement_descriptor": "PaddlePit",
                    "payment_method_allowed": [
                        "card",
                        "gcash",
                        "paymaya"
                    ],
                    "metadata": {
                        "booking_id": booking_id,
                        "email": email
                    }
                }
            }
        }

        response = requests.post(
            f"{PAYMONGO_API_URL}/payment_intents",
            json=payment_data,
            headers=headers,
            timeout=10
        )

        response_data = response.json()

        # Check for errors in response
        if "errors" in response_data:
            error_msg = response_data["errors"][0]["detail"]
            raise Exception(f"PayMongo error: {error_msg}")

        if response.status_code not in [200, 201]:
            raise Exception(f"PayMongo error: {response.text}")

        payment_intent = response_data
        return {
            "success": True,
            "payment_intent_id": payment_intent["data"]["id"],
            "client_key": payment_intent["data"]["attributes"]["client_key"],
            "status": payment_intent["data"]["attributes"]["status"]
        }

    except requests.exceptions.RequestException as e:
        return {
            "success": False,
            "error": f"PayMongo request failed: {str(e)}"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

@router.post("/booking")
def create_booking(request: CreateBookingRequest):
    """
    Create a new booking and process payment through PayMongo.
    Returns booking details if successful, error if payment fails.
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

        # Create booking and transaction records (in real implementation, use database)
        # For now, we'll create them in memory and process payment

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
                    "price": COURT_RATES[item.court_id] * calculate_booking_duration_hours(item.start_time, item.end_time)
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
