"""PayMongo payment processing for bookings."""
import requests
import base64
import os

PAYMONGO_SECRET_KEY = os.getenv("PAYMONGO_SECRET_KEY")
PAYMONGO_API_URL = "https://api.paymongo.com/v1"


def process_paymongo_payment(amount_centavos: int, booking_id: str, email: str) -> dict:
    """
    Process payment through PayMongo Payments API.

    Creates a payment intent that can be confirmed by the customer.
    Amount should be in centavos (e.g., 100 pesos = 10000 centavos).

    Args:
        amount_centavos: Payment amount in centavos
        booking_id: Unique booking identifier
        email: Customer email address

    Returns:
        Dict with payment_intent_id, client_key, and status if successful
        Dict with error message if failed

    Example:
        >>> result = process_paymongo_payment(50000, "booking-123", "user@example.com")
        >>> if result["success"]:
        ...     payment_id = result["payment_intent_id"]
        ...     client_key = result["client_key"]
    """
    try:
        # Validate amount
        if amount_centavos <= 0:
            raise ValueError("Amount must be greater than 0")

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
