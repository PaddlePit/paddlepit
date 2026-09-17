from fastapi import APIRouter, HTTPException
from datetime import datetime

router = APIRouter()

# Dummy promo codes for testing
DUMMY_PROMO_CODES = {
    "PROMO20": {
        "coupon_code": "PROMO20",
        "discount_amount": 100,
        "valid_from": datetime(2026, 1, 1),
        "valid_until": datetime(2026, 12, 31),
        "is_active": True,
        "usage_limit": 100,
        "times_used": 5
    },
    "SUMMER50": {
        "coupon_code": "SUMMER50",
        "discount_amount": 250,
        "valid_from": datetime(2026, 6, 1),
        "valid_until": datetime(2026, 8, 31),
        "is_active": False,  # Expired
        "usage_limit": 50,
        "times_used": 50
    },
    "WELCOME100": {
        "coupon_code": "WELCOME100",
        "discount_amount": 500,
        "valid_from": datetime(2026, 1, 1),
        "valid_until": datetime(2026, 12, 31),
        "is_active": True,
        "usage_limit": 1000,
        "times_used": 120
    }
}

@router.get("/promo/{code}")
def validate_promo(code: str):
    """
    Validate a promo code and return discount amount if valid.
    Returns 404 if code doesn't exist or is invalid.
    """
    try:
        code = code.upper()

        if code not in DUMMY_PROMO_CODES:
            raise HTTPException(
                status_code=404,
                detail=f"Promo code '{code}' not found"
            )

        promo = DUMMY_PROMO_CODES[code]
        now = datetime.utcnow()

        # Check if promo is active
        if not promo["is_active"]:
            raise HTTPException(
                status_code=400,
                detail="Promo code is no longer active"
            )

        # Check if promo is within valid date range
        if now < promo["valid_from"] or now > promo["valid_until"]:
            raise HTTPException(
                status_code=400,
                detail="Promo code is expired or not yet valid"
            )

        # Check if usage limit reached
        if promo["times_used"] >= promo["usage_limit"]:
            raise HTTPException(
                status_code=400,
                detail="Promo code usage limit reached"
            )

        return {
            "valid": True,
            "coupon_code": promo["coupon_code"],
            "discount_amount": promo["discount_amount"]
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error validating promo code: {str(e)}"
        )
